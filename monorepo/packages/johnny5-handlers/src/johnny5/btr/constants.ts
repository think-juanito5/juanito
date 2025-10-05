export const SdsErrorMessages = {
  MISSING_JOB_META: {
    userMessage:
      'Job submission failed: The matter metadata is missing or incomplete. ',
    logMessage: 'Job metadata is missing or incomplete',
    httpStatus: 400,
  },
  MISSING_PAYLOAD_META: {
    userMessage:
      'Job submission failed: The Seller Disclosure Statement (SDS) Payload metadata is missing or incomplete.',
    logMessage: 'SDS Webhook Payload metadata is missing or incomplete',
    httpStatus: 400,
  },
  INCOMPLETE_SDS_WEBHOOK: {
    userMessage:
      'Job submission failed: The Seller Disclosure Statement (SDS) Webhook payload is incomplete. Please ensure all required fields are provided.',
    logMessage: 'SDS Webhook Payload is incomplete',
    httpStatus: 400,
  },
  INVALID_SDS_PROPERTY: {
    userMessage: 'Invalid request: The SDS property is not valid.',
    logMessage: 'SDS property validation failed',
    httpStatus: 400,
  },
  INVALID_CONVEYANCER_AREA: {
    userMessage: 'Invalid request: The conveyancer area is not valid.',
    logMessage: 'SDS conveyancer area validation failed',
    httpStatus: 400,
  },
  MISSING_TEMPLATE_MATTER_ID: {
    userMessage:
      'Job submission failed: The SDS template matter ID is missing from the job metadata.',
    logMessage: 'SDS template matter ID is missing from job metadata',
    httpStatus: 400,
  },
  MISSING_MATTER_NAME: {
    userMessage:
      'Job submission failed: The matter name is missing from the job metadata.',
    logMessage: 'Matter name is missing from job metadata',
    httpStatus: 400,
  },
  TEMPLATE_NOT_FOUND: {
    userMessage:
      'Job submission failed: The specified file template was not found in Actionstep. Please check the configuration and ensure the template exists.',
    logMessage: 'File template not found in Actionstep',
    httpStatus: 404,
  },
  MISSING_TRUST_ACCOUNT: {
    userMessage:
      'Job submission failed: The trust account is missing from the configuration. It is required for matter creation.',
    logMessage: 'Trust account is missing from configuration',
    httpStatus: 500,
  },
  MISSING_PARTICIPANT_CONVEYANCER: {
    userMessage:
      'Job submission failed: The Participant Conveyancer is required during Stepchange in Actionstep flow automation but is not associated with this matter.',
    logMessage: 'Participant Conveyancer is missing for Stepchange',
    httpStatus: 400,
  },
  MANIFEST_NOT_FOUND: {
    userMessage:
      'Job submission failed: The manifest for the specified file and job ID was not found.',
    logMessage: 'Manifest not found for specified file and job ID',
    httpStatus: 404,
  },
  MATTER_ID_UNKNOWN: {
    userMessage:
      'Job submission failed: The Matter ID is unknown from the manifest for the specified file and job ID.',
    logMessage:
      'Matter ID is unknown from manifest for specified file and job ID',
    httpStatus: 400,
  },
  MISSING_ASSIGNED_TO_PARTICIPANT_ID: {
    userMessage:
      'Job submission failed: The Assigned To Participant Id is missing from the job metadata.',
    logMessage: 'Assigned To Participant Id is missing from job metadata',
    httpStatus: 400,
  },
  ERROR_UPDATING_JOB_AND_FILE: {
    userMessage:
      'Job submission failed: An error occurred while updating the Job and File with the new matterId and status.',
    logMessage: 'Error updating Job and File with new matterId and status',
    httpStatus: 500,
  },
  MATTER_CREATION_FAILED: {
    userMessage:
      'Job submission failed: The Matter could not be created in Actionstep. Please check the configuration and ensure all required fields are provided.',
    logMessage: 'Matter creation failed in Actionstep',
    httpStatus: 500,
  },
  MANIFEST_INVALID: {
    userMessage:
      'Job submission failed: The generated manifest is invalid. Please review the manifest structure and ensure it adheres to the required schema.',
    logMessage: 'Generated manifest is invalid',
    httpStatus: 400,
  },
  INTERNAL_ERROR: {
    userMessage: 'An unexpected error occurred. Please try again later.',
    logMessage: 'Internal server error',
    httpStatus: 500,
  },
} as const

export type SdsErrorCode = keyof typeof SdsErrorMessages

/**
 * Represents the BTR roles in Actionstep
 */
export const BtrActionstepRoles: { [key: number]: string } = {
  80: 'Client/Seller',
  105: 'Property Address',
  114: 'Agent (Office)',
  81: 'Agent Primary Contact',
}
