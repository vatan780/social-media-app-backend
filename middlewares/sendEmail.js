const nodeMailer=require("nodemailer");

exports.sendEmail=async (options)=>{
    const transproter=nodeMailer.createTransport({
        SMPT_HOST:"smpt.gmail.com",

        // host:process.env.SMPT_HOST,
        port:process.env.SMPT_PORT,
        // port: 456,
        secure: false,

        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
        },
        service:process.env.SMPT_SERVICE,

        
            // host: "sandbox.smtp.mailtrap.io",
            // port: 2525,
            // auth: {
            //   user: "2497b7ebfd9eeb",
            //   pass: "9e7f6cb2760ec4"
            // }
    })

    const mailOptions={
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    }
    await transproter.sendMail(mailOptions)
}