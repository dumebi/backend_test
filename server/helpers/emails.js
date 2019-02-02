/**
 * return full email body
 * @param {string} partialBody
 */
exports.emailBody = (partialBody) => {
  const body = `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta name="description" content="">
            <meta name="author" content="">
            <link href="https://fonts.googleapis.com/css?family=Muli:200" rel="stylesheet">
            <title>Sterling Exchange</title>
        </head>

        <body style="max-width: 600px;margin: 10px auto;padding: 70px;border: 1px solid #ccc;background: #ffffff;color: #4e4e4e;font-family: Muli;">
            <div>
                <div style="margin-bottom: 3rem;">
                    <!-- <img src="" width='120px' alt="Altmall"> -->
                </div>
                ${partialBody}
                <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
                    Cheers, <br>
                    The Sterling Exchange Team
                </p>
            </div>
        </body>
        </html>
    `;
  return body;
}

/**
 * Send a user token
 * @param {object} user
 * @param {string} token
 */
exports.sendUserToken = (user, token) => {
  const partialBody = `
        <h3>Hi ${user.fname},</h3>
        <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
            Find below a one-time token to complete your registration. <br>
            Token: <strong>${token}</strong>
        </p>
        <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
            If you are having any issues signing up, contact <strong>Sterling Support</strong>
        </p>
    `;
  const body = this.emailBody(partialBody);
  return body;
}

/**
 * send a user signup email
 * @param {object} user
 */
exports.sendUserSignupEmail = (user, link) => {
  const partialBody = `
        <h3>Welcome to the Sterling Token Portal</h3>
        <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
            We are so glad to have you here ${user.fname}.<br>
        </p>
        <p style="margin-bottom: 2em;line-height: 26px;font-size: 14px;">
            Get started immediately by activating your account, click <a href='${link}'>here</a> <br> 
            For further questions, you can contact <strong>Sterling Support</strong>
        </p>
    `;
  const body = this.emailBody(partialBody);
  return body;
}
