const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')

class Email {
    constructor(user, url){
        this.to = user.email,
        this.firstName = user.name.split(' ')[0],
        this.url = url,
        this.from = `Gyanendra Verma <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                }
                
            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 2525,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            }
            
        })
    }

    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject
        })

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the natours family!!')
    }

    async resetPassword(){
        await this.send('resetPassword', 'Reset your password, valid for 10 minutes only')
    }
}

module.exports = Email;