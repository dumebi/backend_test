/* eslint-disable no-undef */
const expect = require('chai').expect
const supertest = require('supertest')
const { config } = require('../helpers/utils');

const api = supertest(`${config.host}`)

describe('Admin Test', () => {
  let user_jwt = ''
  let user_id = ''
  let admin_jwt = ''

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
    const staffId = '16738'
    api
      .post('users/create')
      .set('Accept', 'application/json')
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
        expect(res.body.data.email).to.equal(user_email)
        expect(res.body.data.password).to.not.equal(user_pass)
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
    const staffId = '74895'
    api
      .post('users/create')
      .set('Accept', 'application/json')
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
        expect(res.body.data.email).to.equal(user_email)
        expect(res.body.data.password).to.not.equal(user_pass)
        admin_jwt = res.body.data.token;
        done()
      })
  }).timeout(10000)

  it('Should get a user', (done) => {
    api
      .get(`users/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', admin_jwt)
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
      .set('authorization', admin_jwt)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should get all user types', (done) => {
    api
      .get('users/types')
      .set('Accept', 'application/json')
      .set('authorization', admin_jwt)
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
      .set('authorization', admin_jwt)
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
      .set('authorization', admin_jwt)
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
      .set('authorization', admin_jwt)
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
      .set('authorization', admin_jwt)
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
      .set('authorization', admin_jwt)
      .send({
        type
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
      .set('authorization', admin_jwt)
      .send({
        type
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data.message).to.equal('User deactivated')
        done()
      })
  }).timeout(10000)
})
