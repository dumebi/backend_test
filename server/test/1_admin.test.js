/* eslint-disable no-undef */
const mongoose = require('mongoose');
const expect = require('chai').expect
const supertest = require('supertest')
const { config } = require('../helpers/utils');


const api = supertest(`${config.host}`)

describe('Admin Test', () => {
  let user_jwt = ''
  let user_id = ''
  let admin_jwt = ''
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImlkIjoiNWMzN2E0ODZjMmRhYzgxNzM2ZjE4MmNiIiwidHlwZSI6IkFkbWluIiwiaWF0IjoxNTQ3NDk4MzAzLCJleHAiOjE1NDc1ODQ3MDN9.Q9TtOXm1w2zG6oXZ9td9pWOd2Eaa92Du3Soql22DIcI'

  before(async () => {
    // await mongoose.connect(utils.config.mongo, { useNewUrlParser: true });
    console.log(config.mongo);
    await mongoose.connect(config.mongo, { useNewUrlParser: true });
    await mongoose.connection.db.dropDatabase();
  });

  it('Should signin an admin ', (done) => {
    api
      .post('users/login')
      .set('Accept', 'application/json')
      .send({
        email: 'admin@gmail.com',
        password: 'John'
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(user_email)
        expect(res.body.data.password).to.not.equal(user_pass)
        user_address = res.body.data.address;
        user_jwt = res.body.data.token;
        user_wallet = res.body.data.wallet;
        user_id = res.body.data._id;
        done()
      })
  }).timeout(10000)

  it('Should create a user', (done) => {
    const fname = 'John'
    const lname = 'Doe'
    const email = `johndoe${Math.floor(Math.random() * 1000)}@gmail.com`
    const phone = '2348184364720'
    const sex = 'Male'
    const dob = '15-01-1992'
    const password = 'John'
    const vesting = true
    const type = 'User'
    const employment = 'Employed'
    const group = 'Senior Executive'
    const staffId = `${Math.floor(Math.random() * 1000000)}`
    api
      .post('users/create')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`)
      .send({
        fname,
        lname,
        email,
        phone,
        sex,
        dob,
        password,
        vesting,
        type,
        employment,
        group,
        staffId
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.fname).to.equal(fname)
        expect(res.body.data.lname).to.equal(lname)
        expect(res.body.data.phone).to.equal(phone)
        expect(res.body.data.sex).to.equal(sex)
        expect(res.body.data.dob).to.equal(dob)
        expect(res.body.data.vesting).to.equal(vesting)
        expect(res.body.data.type).to.equal(type)
        expect(res.body.data.employment).to.equal(employment)
        expect(res.body.data.group).to.equal(group)
        expect(res.body.data.staffId).to.equal(staffId)
        expect(res.body.data.password).to.not.equal(password)
        user_jwt = res.body.data.token;
        user_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create a admin', (done) => {
    const fname = 'Admin'
    const lname = 'Admin'
    const email = `admin${Math.floor(Math.random() * 1000)}@gmail.com`
    const phone = '2348184364720'
    const sex = 'Male'
    const dob = '15-01-1992'
    const password = 'John'
    const vesting = true
    const type = 'Admin'
    const employment = 'Employed'
    const group = 'Executive Trainee'
    const staffId = `${Math.floor(Math.random() * 1000000)}`
    api
      .post('users/create')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${token}`)
      .send({
        fname,
        lname,
        email,
        phone,
        sex,
        dob,
        password,
        vesting,
        type,
        employment,
        group,
        staffId
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.fname).to.equal(fname)
        expect(res.body.data.lname).to.equal(lname)
        expect(res.body.data.phone).to.equal(phone)
        expect(res.body.data.sex).to.equal(sex)
        expect(res.body.data.dob).to.equal(dob)
        expect(res.body.data.vesting).to.equal(vesting)
        expect(res.body.data.type).to.equal(type)
        expect(res.body.data.employment).to.equal(employment)
        expect(res.body.data.group).to.equal(group)
        expect(res.body.data.staffId).to.equal(staffId)
        expect(res.body.data.password).to.not.equal(password)
        admin_jwt = res.body.data.token;
        done()
      })
  }).timeout(10000)

  it('Should get a user', (done) => {
    api
      .get(`users/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        done()
      })
  }).timeout(10000)

  it('Should get all users', (done) => {
    api
      .get('users')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user types', (done) => {
    api
      .get('users/type')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user groups', (done) => {
    api
      .get('users/group')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user employment statuses', (done) => {
    api
      .get('users/employment-status')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should update a user group', (done) => {
    const group = 'Senior Executive'
    api
      .patch(`users/${user_id}/group`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        group
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.group).to.equal(group)
        done()
      })
  }).timeout(10000)

  it('Should update a user type', (done) => {
    const type = 'User'
    api
      .patch(`users/${user_id}/type`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        type
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.type).to.equal(type)
        done()
      })
  }).timeout(10000)

  it('Should update a user employment status', (done) => {
    const employment = 'Employed'
    api
      .patch(`users/${user_id}/employment-status`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        employment
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.employment).to.equal(employment)
        done()
      })
  }).timeout(10000)

  it('Should deactivate a user', (done) => {
    api
      .patch(`users/deactivate/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('User deactivated')
        done()
      })
  }).timeout(10000)
})
