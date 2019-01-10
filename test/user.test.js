/* eslint-disable no-undef */
const expect = require('chai').expect
const supertest = require('supertest')
const { envConfig } = require('../utils/utils');

const api = supertest(`${envConfig.host}`)

describe('Mall Test', () => {
  let user_id = ''
  let user_jwt = ''
  let user_email = ''
  let user_pass = ''
  let user_token = ''
  let saved_item = ''
  let cart_item = ''

  it('Should register a user', (done) => {
    const fname = 'John'
    const lname = 'Doe'
    const randomNum = Math.floor(Math.random() * 1000)
    const email = `johndoe${randomNum}@gmail.com`
    // const phone = '2348784563728'
    const bvn = '22357440001'
    const password = 'password'
    const sex = 'M'
    const dob = '15-09-1995'
    api
      .post('auth/register')
      .set('Accept', 'application/json')
      .send({
        fname,
        lname,
        email,
        // phone,
        bvn,
        sex,
        dob,
        password
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.fname).to.equal(fname)
        expect(res.body.data.lname).to.equal(lname)
        expect(res.body.data.email).to.equal(email)
        // expect(res.body.data.phone).to.equal(phone)
        expect(res.body.data.bvn).to.equal(bvn)
        expect(res.body.data.sex).to.equal(sex)
        expect(res.body.data.dob).to.equal(dob)
        expect(res.body.data.password).to.not.equal(password)

        user_id = res.body.data._id
        user_email = email
        user_pass = password
        done()
      })
  }).timeout(100000)

  it('Should signin a user', (done) => {
    api
      .post('auth/login')
      .set('Accept', 'application/json')
      .send({
        email: user_email,
        password: user_pass
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(user_email)
        expect(res.body.data.password).to.not.equal(user_pass)
        // user_address = res.body.data.address;
        done()
      })
  }).timeout(10000)

  it('Should get all users', (done) => {
    api
      .get('users/')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data.set).to.be.instanceof(Array)
        done()
      })
  }).timeout(200000)

  it('Should get a user', (done) => {
    api
      .get(`users/${user_id}`)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.equal(user_id)
        done()
      })
  }).timeout(200000)

  it('Should send a forgot password token', (done) => {
    api
      .post('auth/send-token')
      .set('Accept', 'application/json')
      .send({
        email: user_email,
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        user_token = res.body.data.token
        done()
      })
  }).timeout(10000)

  // it('Should verify a forgot password token', (done) => {
  //   api
  //     .post('auth/send-token')
  //     .set('Accept', 'application/json')
  //     .send({
  //       email: user_email,
  //       token: user_token,
  //     })
  //     .expect(200)
  //     .end((err, res) => {
  //       expect(res.body.status).to.equal('success')
  //       user_token = res.body.data.token
  //       done()
  //     })
  // }).timeout(10000)

  it('Should reset a user password', (done) => {
    const password = 'password'
    api
      .patch('auth/reset-pass')
      .set('Accept', 'application/json')
      .send({
        email: user_email,
        token: user_token,
        password,
      })
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        user_jwt = res.body.data.token
        expect(res.body.status).to.equal('success')
        expect(res.body.data.password).to.not.equal(password)
        done()
      })
  }).timeout(10000)

  it('Should add to user saved items', (done) => {
    const items = [{
      product: '5bd0a45162e72c7d9887730c',
      quantity: '2',
      size: null,
      color: null
    }, {
      product: '5bd0a45162e72c7d98877310',
      quantity: '1',
      size: null,
      color: null
    }]
    api
      .post('users/saved-items')
      .set('Accept', 'application/json')
      .set('usertoken', user_jwt)
      .send({
        items
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        // expect(res.body.data.set.user).to.equal(user_id)
        expect(res.body.data.total_count).to.equal(res.body.data.set.items.length)
        expect(res.body.data.set.items).to.have.lengthOf.above(1)
        done()
      })
  }).timeout(10000)

  it('Should get user saved items', (done) => {
    api
      .get('users/saved-items')
      .set('Accept', 'application/json')
      .set('usertoken', user_jwt)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        // expect(res.body.data.set.user).to.equal(user_id)
        expect(res.body.data.total_count).to.equal(res.body.data.set.items.length)
        expect(res.body.data.set.items).to.have.lengthOf.above(1)
        saved_item = res.body.data.set.items[0]._id
        done()
      })
  }).timeout(10000)

  it('Should remove a user saved item', (done) => {
    api
      .delete(`users/saved-items/${saved_item}`)
      .set('Accept', 'application/json')
      .set('usertoken', user_jwt)
      .expect(200)
      .end((err, res) => {
        // console.log(res.body)
        expect(res.body.status).to.equal('success')
        // expect(res.body.data.set.user).to.equal(user_id)
        expect(res.body.data.total_count).to.equal(res.body.data.set.items.length)
        expect(res.body.data.set.items).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)

  it('Should add to user cart', (done) => {
    const items = [{
      product: '5bd0a45162e72c7d9887730c',
      quantity: '2',
      size: null,
      color: null
    }, {
      product: '5bd0a45162e72c7d98877310',
      quantity: '1',
      size: null,
      color: null
    }]
    api
      .post('users/cart')
      .set('Accept', 'application/json')
      .set('usertoken', user_jwt)
      .send({
        items
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        // expect(res.body.data.set.user).to.equal(user_id)
        expect(res.body.data.total_count).to.equal(res.body.data.set.items.length)
        expect(res.body.data.set.items).to.have.lengthOf.above(1)
        done()
      })
  }).timeout(10000)

  it('Should get user cart', (done) => {
    api
      .get('users/cart')
      .set('Accept', 'application/json')
      .set('usertoken', user_jwt)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        // expect(res.body.data.set.user).to.equal(user_id)
        expect(res.body.data.total_count).to.equal(res.body.data.set.items.length)
        expect(res.body.data.set.items).to.have.lengthOf.above(1)
        cart_item = res.body.data.set.items[0]._id
        done()
      })
  }).timeout(10000)

  it('Should remove a user cart item', (done) => {
    api
      .delete(`users/cart/${cart_item}`)
      .set('Accept', 'application/json')
      .set('usertoken', user_jwt)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        // expect(res.body.data.set.user).to.equal(user_id)
        expect(res.body.data.total_count).to.equal(res.body.data.set.items.length)
        expect(res.body.data.set.items).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)
})
