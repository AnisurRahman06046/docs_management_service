import axios from 'axios';
import config from '../../../config';
import { logger } from '../../../shared/logger';
import { buildChecklist } from '../../../shared/utils';
import { documentRepository } from './document.repository';

/**
 * Sync user's document checklist with external user service
 * Called after successful document creation/update
 */
const syncUserChecklist = async (agencyId: string, userId: string): Promise<void> => {
  try {
    // Get all user's documents with their document types
    const documents = await documentRepository.findByUser(agencyId, userId);

    // Extract unique document type names
    const documentTypeNames = [
      ...new Set(
        documents
          .filter((doc): doc is typeof doc & { documentType: { name: string } } =>
            Boolean(doc.documentType?.name)
          )
          .map((doc) => doc.documentType.name)
      ),
    ];

    // Build checklist with camelCase keys
    const checklist = buildChecklist(documentTypeNames);

    // Call external API
    const url = `${config.externalServices.userServiceBaseUrl}/student/profile/documents/checklist/${userId}`;

    logger.info(`Syncing checklist for user ${userId}`, { checklist, url });

    await axios.patch(url, { checklist }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    logger.info(`Checklist synced successfully for user ${userId}`);
  } catch (error) {
    // Log error but don't fail the main operation
    // Checklist sync is a side effect, not critical
    if (axios.isAxiosError(error)) {
      logger.error(`Failed to sync checklist for user ${userId}:`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      logger.error(`Failed to sync checklist for user ${userId}:`, error);
    }
  }
};

export const ChecklistSyncService = {
  syncUserChecklist,
};
