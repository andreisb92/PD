// Notification types
export const NOTIFICATION_TYPES = {
  RETURN_REMINDER: 'RETURN_REMINDER',
  NEW_RECOMMENDATION: 'NEW_RECOMMENDATION',
  BOOK_AVAILABLE: 'BOOK_AVAILABLE',
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
  LOAN_CONFIRMATION: 'LOAN_CONFIRMATION',
  LOAN_RETURNED: 'LOAN_RETURNED'
};

// Email templates
const EMAIL_TEMPLATES = {
  [NOTIFICATION_TYPES.RETURN_REMINDER]: (data) => ({
    subject: `Recordatorio: Devolver "${data.bookTitle}"`,
    body: `
      Hola ${data.userName},
      
      Te recordamos que el libro "${data.bookTitle}" debe ser devuelto antes del ${new Date(data.dueDate).toLocaleDateString()}.
      
      Por favor, asegúrate de devolverlo a tiempo para evitar cargos por retraso.
      
      Saludos,
      El equipo de la biblioteca
    `
  }),

  [NOTIFICATION_TYPES.NEW_RECOMMENDATION]: (data) => ({
    subject: 'Nuevas recomendaciones para ti',
    body: `
      Hola ${data.userName},
      
      Basado en tus preferencias y lecturas anteriores, te recomendamos los siguientes libros:
      
      ${data.recommendations.map(book => `- ${book.title} por ${book.author}`).join('\n')}
      
      ¡Esperamos que encuentres algo que te guste!
      
      Saludos,
      El equipo de la biblioteca
    `
  }),

  [NOTIFICATION_TYPES.BOOK_AVAILABLE]: (data) => ({
    subject: `¡"${data.bookTitle}" está disponible!`,
    body: `
      Hola ${data.userName},
      
      El libro "${data.bookTitle}" que estabas esperando ahora está disponible.
      
      Tienes 48 horas para recogerlo antes de que vuelva a la lista de espera.
      
      Saludos,
      El equipo de la biblioteca
    `
  }),

  [NOTIFICATION_TYPES.ACCOUNT_UPDATE]: (data) => ({
    subject: 'Actualización de cuenta',
    body: `
      Hola ${data.userName},
      
      Tu cuenta ha sido actualizada con éxito.
      
      Cambios realizados:
      ${data.changes.map(change => `- ${change}`).join('\n')}
      
      Si no realizaste estos cambios, por favor contacta con nosotros inmediatamente.
      
      Saludos,
      El equipo de la biblioteca
    `
  }),

  [NOTIFICATION_TYPES.LOAN_CONFIRMATION]: (data) => ({
    subject: `Confirmación de préstamo: "${data.bookTitle}"`,
    body: `
      Hola ${data.userName},
      
      Tu préstamo del libro "${data.bookTitle}" ha sido confirmado.
      
      Detalles del préstamo:
      - Fecha de préstamo: ${new Date(data.borrowDate).toLocaleDateString()}
      - Fecha de devolución: ${new Date(data.dueDate).toLocaleDateString()}
      
      Saludos,
      El equipo de la biblioteca
    `
  }),

  [NOTIFICATION_TYPES.LOAN_RETURNED]: (data) => ({
    subject: `Confirmación de devolución: "${data.bookTitle}"`,
    body: `
      Hola ${data.userName},
      
      Gracias por devolver el libro "${data.bookTitle}".
      
      Detalles de la devolución:
      - Fecha de devolución: ${new Date(data.returnDate).toLocaleDateString()}
      ${data.lateFee ? `- Cargo por retraso: $${data.lateFee}` : ''}
      
      Saludos,
      El equipo de la biblioteca
    `
  })
};

class NotificationService {
  constructor() {
    this.subscribers = new Map();
  }

  // Subscribe to notifications
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId).add(callback);
  }

  // Unsubscribe from notifications
  unsubscribe(userId, callback) {
    if (this.subscribers.has(userId)) {
      this.subscribers.get(userId).delete(callback);
    }
  }

  // Send notification to a specific user
  async sendNotification(userId, type, data) {
    try {
      // Get email template
      const template = EMAIL_TEMPLATES[type];
      if (!template) {
        throw new Error(`Template not found for notification type: ${type}`);
      }

      // Generate email content
      const { subject, body } = template(data);

      // Send email through API
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type,
          subject,
          body,
          data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      // Notify subscribers
      if (this.subscribers.has(userId)) {
        this.subscribers.get(userId).forEach(callback => {
          callback({ type, data });
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send notifications to multiple users
  async sendBulkNotifications(userIds, type, data) {
    const results = await Promise.all(
      userIds.map(userId => this.sendNotification(userId, type, data))
    );
    return results.every(result => result === true);
  }

  // Schedule a notification for later
  scheduleNotification(userId, type, data, scheduledDate) {
    const delay = scheduledDate.getTime() - Date.now();
    if (delay <= 0) {
      return this.sendNotification(userId, type, data);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.sendNotification(userId, type, data).then(resolve);
      }, delay);
    });
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService(); 