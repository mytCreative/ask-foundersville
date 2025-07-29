const axios = require('axios');

class GHLService {
  constructor() {
    this.apiKey = process.env.GHL_API_KEY;
    this.baseURL = 'https://services.leadconnectorhq.com';
    
    if (!this.apiKey) {
      console.warn('GHL API key not configured. Using mock mode.');
      this.mockMode = true;
    }
  }

  async updateContactWithReviewTag(email) {
    if (this.mockMode) {
      return this.mockUpdateContact(email);
    }

    try {
      // Step 1: Find the contact by email
      const contact = await this.findContactByEmail(email);
      
      if (!contact) {
        console.log(`No GHL contact found for email: ${email}`);
        return { success: false, reason: 'Contact not found' };
      }

      // Step 2: Add the "review received" tag
      await this.addTagToContact(contact.id, 'review received');
      
      console.log(`Successfully added review tag to contact: ${email}`);
      return { success: true, contactId: contact.id };

    } catch (error) {
      console.error('GHL Service Error:', error.response?.data || error.message);
      throw new Error('Failed to update GHL contact');
    }
  }

  async findContactByEmail(email) {
    try {
      const response = await axios.get(`${this.baseURL}/contacts/lookup`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          email: email,
        }
      });

      return response.data.contacts?.[0] || null;
    } catch (error) {
      console.error('Error finding GHL contact:', error.response?.data || error.message);
      return null;
    }
  }

  async addTagToContact(contactId, tag) {
    try {
      const response = await axios.post(
        `${this.baseURL}/contacts/${contactId}/tags`,
        { tags: [tag] },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding tag to GHL contact:', error.response?.data || error.message);
      throw error;
    }
  }

  // Mock methods for development
  mockUpdateContact(email) {
    console.log(`Mock: Adding 'review received' tag to GHL contact: ${email}`);
    return { success: true, contactId: 'mock-contact-id' };
  }
}

module.exports = new GHLService();