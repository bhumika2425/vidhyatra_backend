const request = require('supertest');
const app = require('../app');
const { Academic } = require('../models');
const { Admin } = require('../models');
const jwt = require('jsonwebtoken');

describe('Academic Calendar API', () => {
    let adminToken;
    let userToken;
    let testEventId;

    beforeAll(async () => {
        // Create test admin
        const admin = await Admin.create({
            name: 'Test Admin',
            email: 'testadmin@test.com',
            password: 'password123',
            role: 'Admin'
        });

        // Create test user
        const user = await User.create({
            name: 'Test User',
            email: 'testuser@test.com',
            password: 'password123',
            role: 'Student',
            year: '1st year'
        });

        // Generate tokens
        adminToken = jwt.sign({ admin_id: admin.admin_id }, process.env.JWT_SECRET);
        userToken = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET);
    });

    afterAll(async () => {
        // Clean up test data
        await Academic.destroy({ where: {} });
        await Admin.destroy({ where: { email: 'testadmin@test.com' } });
        await User.destroy({ where: { email: 'testuser@test.com' } });
    });

    describe('POST /api/academic/events', () => {
        it('should create a new exam event', async () => {
            const examData = {
                title: 'Final Exam - Mathematics',
                description: 'End semester examination for Mathematics',
                eventType: 'EXAM',
                examType: 'Final',
                subject: 'Mathematics',
                startDate: '2025-06-01',
                endDate: '2025-06-01',
                startTime: '10:00:00',
                duration: 180,
                venue: 'Hall A',
                year: '1st year',
                semester: 'First'
            };

            const response = await request(app)
                .post('/api/academic/events')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(examData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('exam created successfully.');
            expect(response.body.event.title).toBe(examData.title);
            testEventId = response.body.event.id;
        });

        it('should create a new holiday event', async () => {
            const holidayData = {
                title: 'Dashain Break',
                description: 'College closed for Dashain festival',
                eventType: 'HOLIDAY',
                holidayType: 'Festival',
                startDate: '2025-10-01',
                endDate: '2025-10-15',
                year: '1st year',
                semester: 'First'
            };

            const response = await request(app)
                .post('/api/academic/events')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(holidayData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('holiday created successfully.');
            expect(response.body.event.title).toBe(holidayData.title);
        });
    });

    describe('GET /api/academic/events', () => {
        it('should get all events for admin', async () => {
            const response = await request(app)
                .get('/api/academic/events')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.length).toBeGreaterThan(0);
        });

        it('should get only year-specific events for user', async () => {
            const response = await request(app)
                .get('/api/academic/events')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.every(event => event.year === '1st year')).toBe(true);
        });

        it('should filter events by date range', async () => {
            const response = await request(app)
                .get('/api/academic/events')
                .query({
                    startDate: '2025-10-01',
                    endDate: '2025-10-31'
                })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.events)).toBe(true);
            expect(response.body.events.every(event => 
                new Date(event.startDate) >= new Date('2025-10-01') &&
                new Date(event.endDate) <= new Date('2025-10-31')
            )).toBe(true);
        });
    });

    describe('PUT /api/academic/events/:id', () => {
        it('should update an existing event', async () => {
            const updateData = {
                title: 'Updated Math Exam',
                description: 'Updated description'
            };

            const response = await request(app)
                .put(`/api/academic/events/${testEventId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.event.title).toBe(updateData.title);
            expect(response.body.event.description).toBe(updateData.description);
        });

        it('should not allow non-admin to update event', async () => {
            const response = await request(app)
                .put(`/api/academic/events/${testEventId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Try to update' });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/academic/events/:id', () => {
        it('should delete an existing event', async () => {
            const response = await request(app)
                .delete(`/api/academic/events/${testEventId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Academic event deleted successfully');

            // Verify event is deleted
            const getResponse = await request(app)
                .get(`/api/academic/events/${testEventId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(getResponse.status).toBe(404);
        });
    });
});
