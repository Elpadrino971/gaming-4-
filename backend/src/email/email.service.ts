import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, username: string) {
    const msg = {
      to: email,
      from: {
        email: this.configService.get<string>('EMAIL_FROM', 'noreply@bingoshop.fr'),
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'BingoShop'),
      },
      subject: '🎉 Bienvenue sur BingoShop !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #a855f7; margin: 0; }
            .content { line-height: 1.6; color: #333; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎰 BingoShop</h1>
            </div>
            <div class="content">
              <h2>Bienvenue ${username} ! 🎉</h2>
              <p>Merci de vous être inscrit sur BingoShop, la plateforme de bingo en ligne la plus excitante !</p>

              <p><strong>Voici ce qui vous attend :</strong></p>
              <ul>
                <li>🎮 Des parties de bingo en temps réel</li>
                <li>💰 Gagnez des crédits et des lots physiques</li>
                <li>🎁 Roue quotidienne gratuite</li>
                <li>🏆 Système d'achievements et de niveaux</li>
                <li>⭐ Programme VIP exclusif</li>
              </ul>

              <p style="text-align: center;">
                <a href="${this.configService.get('FRONTEND_URL')}/dashboard" class="button">
                  Commencer à jouer
                </a>
              </p>

              <p>Besoin d'aide ? Notre support est disponible 7j/7.</p>
            </div>
            <div class="footer">
              <p>© 2024 BingoShop - Tous droits réservés</p>
              <p><a href="${this.configService.get('FRONTEND_URL')}/legal">Mentions légales</a> | <a href="${this.configService.get('FRONTEND_URL')}/privacy">Confidentialité</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EMAIL] Welcome email sent to ${email}`);
    } catch (error) {
      console.error('[EMAIL] Error sending welcome email:', error);
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(email: string, username: string, credits: number, amount: number) {
    const msg = {
      to: email,
      from: {
        email: this.configService.get<string>('EMAIL_FROM', 'noreply@bingoshop.fr'),
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'BingoShop'),
      },
      subject: '✅ Paiement confirmé - BingoShop',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px;">
            <h1 style="color: #10b981; text-align: center;">✅ Paiement Confirmé</h1>

            <p>Bonjour ${username},</p>
            <p>Votre paiement a été traité avec succès !</p>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Détails de la transaction</h3>
              <p><strong>Crédits reçus :</strong> ${credits} cr</p>
              <p><strong>Montant payé :</strong> ${amount.toFixed(2)}€</p>
              <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <p>Vos crédits sont disponibles immédiatement dans votre compte.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.configService.get('FRONTEND_URL')}/bingo" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px;">
                Jouer maintenant
              </a>
            </div>

            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Un reçu détaillé est disponible dans votre tableau de bord.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EMAIL] Payment confirmation sent to ${email}`);
    } catch (error) {
      console.error('[EMAIL] Error sending payment confirmation:', error);
    }
  }

  /**
   * Send prize won notification
   */
  async sendPrizeWonEmail(email: string, username: string, prizeName: string, prizeValue: number) {
    const msg = {
      to: email,
      from: {
        email: this.configService.get<string>('EMAIL_FROM', 'noreply@bingoshop.fr'),
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'BingoShop'),
      },
      subject: '🎁 Félicitations ! Vous avez gagné un lot !',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px;">
            <h1 style="color: #f59e0b; text-align: center;">🎉 FÉLICITATIONS !</h1>

            <p>Bonjour ${username},</p>
            <p>Vous avez gagné un lot physique à une partie de bingo !</p>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h2 style="margin: 0; color: #92400e;">🎁 ${prizeName}</h2>
              <p style="font-size: 18px; color: #78350f; margin: 10px 0;">Valeur : ${prizeValue.toFixed(2)}€</p>
            </div>

            <h3>Prochaines étapes :</h3>
            <ol>
              <li>Vérifiez votre adresse de livraison dans votre profil</li>
              <li>Nous préparons votre commande</li>
              <li>Vous recevrez un email avec le numéro de suivi dans les 48h</li>
              <li>Livraison sous 2-5 jours ouvrés</li>
            </ol>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.configService.get('FRONTEND_URL')}/orders" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px;">
                Suivre ma commande
              </a>
            </div>

            <p style="font-size: 12px; color: #666;">
              Besoin d'aide ? Contactez-nous à support@bingoshop.fr
            </p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EMAIL] Prize won notification sent to ${email}`);
    } catch (error) {
      console.error('[EMAIL] Error sending prize won email:', error);
    }
  }

  /**
   * Send shipping confirmation with tracking
   */
  async sendShippingConfirmation(
    email: string,
    username: string,
    orderNumber: string,
    trackingNumber: string,
    trackingUrl: string,
    items: any[],
  ) {
    const itemsList = items.map(item => `<li>${item.product.name} x ${item.quantity}</li>`).join('');

    const msg = {
      to: email,
      from: {
        email: this.configService.get<string>('EMAIL_FROM', 'noreply@bingoshop.fr'),
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'BingoShop'),
      },
      subject: `🚚 Votre lot a été expédié ! - Commande #${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px;">
            <h1 style="color: #3b82f6; text-align: center;">📦 Votre colis est en route !</h1>

            <p>Bonjour ${username},</p>
            <p>Excellente nouvelle ! Votre lot a été expédié et sera bientôt chez vous.</p>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Informations d'expédition</h3>
              <p><strong>Commande :</strong> #${orderNumber}</p>
              <p><strong>Transporteur :</strong> Colissimo</p>
              <p><strong>Numéro de suivi :</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px;">${trackingNumber}</code></p>
              <p><strong>Livraison estimée :</strong> 2-5 jours ouvrés</p>
            </div>

            <h3>Articles expédiés :</h3>
            <ul>${itemsList}</ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackingUrl}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 8px;">
                Suivre mon colis
              </a>
            </div>

            <p style="font-size: 12px; color: #666; background: #f9fafb; padding: 15px; border-radius: 8px;">
              💡 <strong>Astuce :</strong> Vous pouvez également suivre votre colis sur le site de La Poste avec le numéro de suivi ci-dessus.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EMAIL] Shipping confirmation sent to ${email}`);
    } catch (error) {
      console.error('[EMAIL] Error sending shipping confirmation:', error);
    }
  }

  /**
   * Send delivery confirmation
   */
  async sendDeliveryConfirmation(email: string, username: string, orderNumber: string) {
    const msg = {
      to: email,
      from: {
        email: this.configService.get<string>('EMAIL_FROM', 'noreply@bingoshop.fr'),
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'BingoShop'),
      },
      subject: '✅ Votre lot a été livré !',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px;">
            <h1 style="color: #10b981; text-align: center;">✅ Livraison Confirmée !</h1>

            <p>Bonjour ${username},</p>
            <p>Votre commande #${orderNumber} a été livrée avec succès !</p>

            <p>Nous espérons que vous appréciez votre lot. 🎁</p>

            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3>Partagez votre expérience !</h3>
              <p>Dites-nous ce que vous pensez de BingoShop</p>
              <a href="${this.configService.get('FRONTEND_URL')}/feedback" style="display: inline-block; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                Laisser un avis
              </a>
            </div>

            <p>Continuez à jouer pour gagner d'autres lots incroyables !</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.configService.get('FRONTEND_URL')}/bingo" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px;">
                Jouer maintenant
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EMAIL] Delivery confirmation sent to ${email}`);
    } catch (error) {
      console.error('[EMAIL] Error sending delivery confirmation:', error);
    }
  }

  /**
   * Send beta invitation email
   */
  async sendBetaInvitation(email: string, inviteCode: string) {
    const inviteUrl = `${this.configService.get('FRONTEND_URL')}/signup?invite=${inviteCode}`;

    const msg = {
      to: email,
      from: {
        email: this.configService.get<string>('EMAIL_FROM', 'noreply@bingoshop.fr'),
        name: this.configService.get<string>('EMAIL_FROM_NAME', 'BingoShop'),
      },
      subject: '🎉 Vous êtes invité à la beta de BingoShop !',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 10px;">
            <h1 style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center;">
              🎰 BingoShop
            </h1>

            <h2 style="text-align: center; color: #333;">Vous êtes invité(e) à notre Beta ! 🎉</h2>

            <p>Vous faites partie des premiers à découvrir BingoShop, la nouvelle plateforme de bingo en ligne révolutionnaire !</p>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #78350f;">Votre code d'invitation</p>
              <h2 style="margin: 10px 0; color: #92400e; letter-spacing: 2px;">${inviteCode}</h2>
            </div>

            <h3>Ce qui vous attend :</h3>
            <ul>
              <li>🎮 Parties de bingo en temps réel</li>
              <li>💰 Gagnez des lots physiques</li>
              <li>🎁 Roue quotidienne gratuite</li>
              <li>🏆 Système d'achievements</li>
              <li>⭐ Accès anticipé aux nouvelles fonctionnalités</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-size: 18px;">
                Créer mon compte
              </a>
            </div>

            <p style="font-size: 12px; color: #666; text-align: center;">
              Ce lien est valable 7 jours
            </p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EMAIL] Beta invitation sent to ${email}`);
    } catch (error) {
      console.error('[EMAIL] Error sending beta invitation:', error);
    }
  }
}
