/* eslint-disable no-undef */
// const mongoose = require('mongoose');
// const expect = require('chai').expect
// const supertest = require('supertest')
// const { config } = require('../helpers/utils');

// const api = supertest(`${config.host}`)

// describe('User Test', () => {
//   let user_id = ''
//   let user_jwt = ''
//   let user_token = ''
//   let user_address = ''
//   let user_wallet = ''
//   const user_email = 'johndoe@gmail.com'
//   const user_pass = 'John'

//   it('Should signin a user', (done) => {
//     api
//       .post('users/login')
//       .set('Accept', 'application/json')
//       .send({
//         email: user_email,
//         password: user_pass
//       })
//       .expect(200)
//       .end((err, res) => {
//         expect(res.body.status).to.equal('success')
//         expect(res.body.data._id).to.have.lengthOf.above(0)
//         expect(res.body.data.email).to.equal(user_email)
//         expect(res.body.data.password).to.not.equal(user_pass)
//         user_address = res.body.data.address;
//         user_jwt = res.body.data.token;
//         user_wallet = res.body.data.wallet;
//         user_id = res.body.data._id;
//         done()
//       })
//   }).timeout(10000)

//   it('Should send a forgot password token', (done) => {
//     api
//       .post('users/send-token')
//       .set('Accept', 'application/json')
//       .send({
//         email: user_email,
//       })
//       .expect(200)
//       .end((err, res) => {
//         expect(res.body.status).to.equal('success')
//         user_token = res.body.data
//         done()
//       })
//   }).timeout(10000)

//   it('Should reset a user password', (done) => {
//     const password = 'John'
//     api
//       .patch('users/reset-pass')
//       .set('Accept', 'application/json')
//       .send({
//         email: user_email,
//         password,
//         token: user_token
//       })
//       .expect(200)
//       .end((err, res) => {
//         user_jwt = res.body.data.token
//         expect(res.body.status).to.equal('success')
//         expect(res.body.data.password).to.not.equal(password)
//         done()
//       })
//   }).timeout(10000)

//   it('Should change a user password', (done) => {
//     const password = 'John'
//     api
//       .patch('users/change-pass')
//       .set('Accept', 'application/json')
//       .set('authorization', `Bearer ${user_jwt}`)
//       .send({
//         password,
//       })
//       .expect(200)
//       .end((err, res) => {
//         expect(res.body.status).to.equal('success')
//         done()
//       })
//   }).timeout(10000)

//   it('Should get user balance', (done) => {
//     api
//       .get('users/balance')
//       .set('Accept', 'application/json')
//       .set('authorization', `Bearer ${user_jwt}`)
//       .expect(200)
//       .end((err, res) => {
//         expect(res.body.status).to.equal('success')
//         done()
//       })
//   }).timeout(10000)

//   it('Should get user bank', (done) => {
//     api
//       .get('users/bank')
//       .set('Accept', 'application/json')
//       .set('authorization', `Bearer ${user_jwt}`)
//       .expect(200)
//       .end((err, res) => {
//         expect(res.body.status).to.equal('success')
//         done()
//       })
//   }).timeout(10000)

//   it('Should update a user', (done) => {
//     api
//       .patch('users/')
//       .set('Accept', 'application/json')
//       .set('authorization', `Bearer ${user_jwt}`)
//       .send({
//         fname: 'John',
//         mname: 'Mrs',
//         lname: 'Doe',
//         phone: '2348763526680',
//         sex: 'Male',
//         dob: '15-03-1990',
//         state: 'Lagos',
//         city: 'Lagos',
//         country: 'Nigeria',
//         beneficiary: 'Mrs Jane Doe'
//       })
//       .expect(200)
//       .end((err, res) => {
//         expect(res.body.status).to.equal('success')
//         expect(res.body.data._id).to.have.lengthOf.above(0)
//         expect(res.body.data.email).to.equal(user_email)
//         expect(res.body.data.password).to.not.equal(user_pass)
//         // expect(res.body.data.fname).to.equal(fname)
//         // expect(res.body.data.mname).to.equal(mname)
//         // expect(res.body.data.lname).to.equal(lname)
//         // expect(res.body.data.sex).to.equal(sex)
//         // expect(res.body.data.dob).to.equal(dob)
//         // expect(res.body.data.state).to.equal(state)
//         // expect(res.body.data.city).to.equal(city)
//         // expect(res.body.data.country).to.equal(country)
//         // expect(res.body.data.beneficiary).to.equal(beneficiary)
//         done()
//       })
//   }).timeout(10000)
// })
