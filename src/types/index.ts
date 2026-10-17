export type PricingModel = 'FIXED_PRICE' | 'TIME_AND_MATERIALS';

export type UserRole = 'PROJECT_MANAGER' | 'CLIENT_SIGNER' | 'LEGAL_COUNSEL';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatar: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  clientName: string;
  clientEmail: string;
  clientOrg: string;
  description: string;
  pricingModel: PricingModel;
  hourlyRate: number;
  baseBudget: number;
  currentBudget: number;
  startDate: string;
  baseDeliveryDate: string;
  currentDeliveryDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED';
  activeScopeVersionId: string;
  complianceRate: number;
}

export interface ScopeVersion {
  id: string;
  projectId: string;
  version: string; // e.g. "v1.0", "v1.1"
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  status: 'DRAFT' | 'APPROVED' | 'SUPERSEDED';
  totalEffortHours: number;
  contractId?: string;
}

export interface Requirement {
  id: string;
  scopeVersionId: string;
  code: string; // e.g. "REQ-101"
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedEffort: number; // hours
  acceptanceCriteria: string;
  isInScope: boolean; // true = In-Scope, false = Out-of-Scope
  outOfScopeReason?: string;
  status: 'BASELINE' | 'IN_PROGRESS' | 'COMPLETED' | 'MODIFIED_BY_CR' | 'ADDED_BY_CR';
  sourceCrId?: string;
}

export type CRClassification = 'IN_ORIGINAL_SCOPE' | 'ADDITIONAL_SCOPE';
export type CRStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'CLIENT_APPROVED' | 'REJECTED';

export interface ChangeRequest {
  id: string;
  crNumber: string;
  projectId: string;
  title: string;
  description: string;
  classification: CRClassification;
  reason: string;
  effortImpactHours: number;
  scheduleImpactDays: number;
  costImpact: number;
  status: CRStatus;
  requestedBy: string;
  requestedRole: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComments?: string;
  targetRequirementId?: string;
  newRequirementData?: {
    title: string;
    category: string;
    description: string;
    acceptanceCriteria: string;
  };
  addendumContractId?: string;
}

export interface ContractClause {
  id: string;
  title: string;
  category: 'SCOPE' | 'PAYMENT' | 'WARRANTY' | 'IP' | 'CHANGE_CONTROL' | 'LIABILITY';
  content: string;
  originalContent: string;
  isRedlined: boolean;
  redlineNote?: string;
  humanizedTitle?: string;
  humanizedContent?: string;
}

export interface Milestone {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID';
}

export type ContractType = 'MSA' | 'SOW' | 'ADDENDUM' | 'NDA';
export type SigningStatus = 'DRAFT' | 'SENT_FOR_SIGNATURE' | 'CLIENT_SIGNED' | 'FULLY_EXECUTED';

export interface SignerInfo {
  name: string;
  email: string;
  title: string;
  organization: string;
  signedDate?: string;
  signatureDataUrl?: string;
  ipAddress?: string;
}

export interface ContractCertificate {
  certificateId: string;
  sha256Hash: string;
  timestamp: string;
  tamperEvidentStatus: 'VALID' | 'TAMPERED';
}

export interface Contract {
  id: string;
  contractNumber: string;
  projectId: string;
  scopeVersionId: string;
  title: string;
  humanizedTitle?: string;
  contractType: ContractType;
  parentContractId?: string;
  relatedCrId?: string;
  clauses: ContractClause[];
  pricingTerms: {
    baseAmount: number;
    ratePerHour?: number;
    paymentMilestones: Milestone[];
  };
  effectiveDate: string;
  deliveryDate: string;
  signingStatus: SigningStatus;
  clientSigner: SignerInfo;
  vendorSigner: SignerInfo;
  certificate?: ContractCertificate;
  documentSummary: string;
  humanizedSummary?: string;
  greetingLetter?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'PROJECT' | 'SCOPE' | 'REQUIREMENT' | 'CHANGE_REQUEST' | 'CONTRACT' | 'SIGNATURE' | 'CLAUSE';
  entityId: string;
  details: string;
  hash: string;
}

export interface SlackAlert {
  id: string;
  channel: string;
  timestamp: string;
  sender: string;
  senderAvatar?: string;
  text: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  actionLabel?: string;
  actionView?: string;
  actionPayload?: string;
}

export interface EmailNotification {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'CONTRACT_SIGNATURE' | 'CR_SUBMISSION' | 'CR_APPROVAL' | 'TIMELINE_SHIFT';
}
