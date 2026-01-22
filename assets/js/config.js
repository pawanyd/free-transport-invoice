/**
 * Configuration Module
 * Contains hardcoded company branding information for document generation
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

/**
 * DocumentConfig object containing company branding information
 * This configuration is used by the DocumentGenerator to include
 * company branding elements in all generated documents
 */
export const DocumentConfig = {
  // Company name to appear on all documents
  companyName: "ABC Transport Company",
  
  // Full company address for document headers
  companyAddress: "123 Transport Street, Industrial Area, Mumbai, Maharashtra 400001, India",
  
  // Path to company logo image
  logoUrl: "assets/images/logo.svg",
  
  // Path to authorized signature image
  signatureUrl: "assets/images/signature.svg",
  
  // Path to company seal image
  sealUrl: "assets/images/seal.svg"
};

// Default export for convenience
export default DocumentConfig;
