import nodemailer from 'nodemailer'
import handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import envConfig from '~/configs'

interface EmailData {
  welcome: { name: string }
  verify: { name: string; verifyLink: string }
  forgotPassword: { name: string; resetLink: string }
}

type TemplateName = keyof EmailData

const templatesDir = path.resolve(process.cwd(), envConfig.EMAIL_TEMPLATE_PATH)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: envConfig.EMAIL_USER,
    pass: envConfig.EMAIL_APP_PASSWORD
  }
})

const loadTemplate = <T extends TemplateName>(templateName: T, data: EmailData[T]): string => {
  const templatePath = path.join(templatesDir, `${templateName}.html`)
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template "${templateName}" does not exist in ${templatePath}`)
  }
  const templateSource = fs.readFileSync(templatePath, 'utf8')
  const template = handlebars.compile(templateSource)
  return template(data)
}

export const sendEmail = async <T extends TemplateName>(
  to: string,
  subject: string,
  templateName: T,
  data: EmailData[T]
): Promise<void> => {
  try {
    const htmlContent = loadTemplate(templateName, data)
    const mailOptions = {
      from: envConfig.EMAIL_USER,
      to,
      subject,
      html: htmlContent
    }
    await transporter.sendMail(mailOptions)
  } catch (error) {
    const chalk = (await import('chalk')).default
    console.error(chalk.red(`Failed to send email: ${(error as Error).message}`))
    throw error
  }
}

export const sendWelcomeEmail = async (to: string, data: EmailData['welcome']) => {
  return await sendEmail(to, 'Chào mừng!', 'welcome', data)
}
