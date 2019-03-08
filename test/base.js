
import mongoose from "mongoose";
const utils = require('../helpers/utils');





it("Creates a user", async () => {
  expect.assertions(3);

  user = await userRepository.create(request);
  expect(user.email).toBe(_.toLower(request.email));
  expect(user.phone_number).toBe(_.toLower(request.phone_number));
  expect(user.dob).toBe(request.dob);
});