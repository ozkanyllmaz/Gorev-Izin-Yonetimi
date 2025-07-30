using System.Net;
using System.Net.Mail;

namespace GorevIzinSistemi.Services
{
    public class EmailSender : IEmailSender
    {
        private readonly IConfiguration config;

        public EmailSender(IConfiguration config) 
        {
            this.config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtp = new SmtpClient(config["EmailSettings:SmtpServer"])
            {
                Port = int.Parse(config["EmailSettings:SmtpPort"]),
                Credentials = new NetworkCredential(
                    config["EmailSettings:SenderEmail"],
                    config["EmailSettings:SenderPassword"]
                    ),
                EnableSsl = true

            };

            var mail = new MailMessage
            {
                From = new MailAddress(config["EmailSettings:SenderEmail"]),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            try
            {
                await smtp.SendMailAsync(mail);
            }
            catch (Exception ex) 
            { 
                Console.WriteLine("SMTP Hatası: " + ex.Message);
                throw;
            }
        }
    }
}
