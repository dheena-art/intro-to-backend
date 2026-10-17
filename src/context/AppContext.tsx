import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  ScopeVersion,
  Requirement,
  ChangeRequest,
  Contract,
  ContractClause,
  AuditLog,
  SlackAlert,
  EmailNotification,
  UserProfile,
  CRStatus,
  ContractType,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_SCOPE_VERSIONS,
  INITIAL_REQUIREMENTS,
  INITIAL_CHANGE_REQUESTS,
  INITIAL_CONTRACTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SLACK_ALERTS,
  INITIAL_EMAILS,
  MOCK_USERS,
} from '../data/mockData';
import {
  supabase,
  safeDb,
  checkSupabaseConnection,
  mapProjectToDb,
  mapProjectFromDb,
  mapScopeVersionToDb,
  mapScopeVersionFromDb,
  mapRequirementToDb,
  mapRequirementFromDb,
  mapChangeRequestToDb,
  mapChangeRequestFromDb,
  mapContractToDb,
  mapContractFromDb,
  mapAuditLogToDb,
  mapAuditLogFromDb,
  mapSlackAlertToDb,
  mapSlackAlertFromDb,
  mapEmailToDb,
  mapEmailFromDb,
} from '../lib/supabase';

// Helper to generate a fake SHA-256 style hash
const generateHash = (content: string) => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256_${hex}${Date.now().toString(16).slice(-6)}${Math.random().toString(16).slice(2, 6)}`;
};

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  availableUsers: UserProfile[];
  projects: Project[];
  activeProject: Project;
  setActiveProject: (p: Project) => void;
  scopeVersions: ScopeVersion[];
  requirements: Requirement[];
  changeRequests: ChangeRequest[];
  contracts: Contract[];
  auditLogs: AuditLog[];
  slackAlerts: SlackAlert[];
  emails: EmailNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedContractId: string | null;
  setSelectedContractId: (id: string | null) => void;
  selectedCrId: string | null;
  setSelectedCrId: (id: string | null) => void;
  
  // Supabase Status and Sync
  supabaseStatus: { connected: boolean; message: string; tablesFound?: boolean };
  loadFromSupabase: () => Promise<void>;

  // Business logic actions
  createProject: (data: Partial<Project>) => Project;
  addRequirement: (req: Omit<Requirement, 'id' | 'code'>) => Requirement;
  updateRequirement: (id: string, data: Partial<Requirement>) => void;
  toggleRequirementInScope: (id: string, reason?: string) => void;
  createScopeVersion: (title: string, desc: string) => ScopeVersion;
  submitChangeRequest: (cr: Omit<ChangeRequest, 'id' | 'crNumber' | 'status' | 'submittedAt'>) => ChangeRequest;
  approveChangeRequest: (crId: string, comments?: string) => void;
  rejectChangeRequest: (crId: string, comments: string) => void;
  generateContractFromScope: (scopeVersionId: string, contractType: ContractType, customTitle?: string) => Contract;
  updateContractClause: (contractId: string, clauseId: string, content: string, note?: string) => void;
  signContract: (contractId: string, signerType: 'client' | 'vendor', signatureDataUrl: string, signerName: string) => void;
  addAuditLog: (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => void;
  sendSlackAlert: (text: string, badge?: string, badgeColor?: any, actionLabel?: string, actionView?: string, actionPayload?: string) => void;
  markEmailAsRead: (emailId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]); // Alex Mercer
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProject, setActiveProjectState] = useState<Project>(INITIAL_PROJECTS[0]);
  const [scopeVersions, setScopeVersions] = useState<ScopeVersion[]>(INITIAL_SCOPE_VERSIONS);
  const [requirements, setRequirements] = useState<Requirement[]>(INITIAL_REQUIREMENTS);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(INITIAL_CHANGE_REQUESTS);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [slackAlerts, setSlackAlerts] = useState<SlackAlert[]>(INITIAL_SLACK_ALERTS);
  const [emails, setEmails] = useState<EmailNotification[]>(INITIAL_EMAILS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedCrId, setSelectedCrId] = useState<string | null>(null);

  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; tablesFound?: boolean }>({
    connected: false,
    message: 'Initializing Supabase connection...',
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Connect to Supabase on mount
  useEffect(() => {
    const initSupabase = async () => {
      const res = await checkSupabaseConnection();
      setSupabaseStatus({
        connected: res.ok,
        tablesFound: res.tablesFound,
        message: res.message,
      });

      if (res.ok && res.tablesFound) {
        await loadFromSupabase();
      }
    };
    initSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      const { data: projData, error: errP } = await supabase.from('projects').select('*');
      if (!errP && projData && projData.length > 0) {
        const loadedProjects = projData.map(mapProjectFromDb);
        setProjects(loadedProjects);
        setActiveProjectState(loadedProjects[0]);

        const { data: svData } = await supabase.from('scope_versions').select('*');
        if (svData && svData.length > 0) setScopeVersions(svData.map(mapScopeVersionFromDb));

        const { data: reqData } = await supabase.from('requirements').select('*');
        if (reqData && reqData.length > 0) setRequirements(reqData.map(mapRequirementFromDb));

        const { data: crData } = await supabase.from('change_requests').select('*');
        if (crData && crData.length > 0) setChangeRequests(crData.map(mapChangeRequestFromDb));

        const { data: ctrData } = await supabase.from('contracts').select('*');
        if (ctrData && ctrData.length > 0) setContracts(ctrData.map(mapContractFromDb));

        const { data: audData } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (audData && audData.length > 0) setAuditLogs(audData.map(mapAuditLogFromDb));

        const { data: slkData } = await supabase.from('slack_alerts').select('*');
        if (slkData && slkData.length > 0) setSlackAlerts(slkData.map(mapSlackAlertFromDb));

        const { data: emData } = await supabase.from('emails').select('*');
        if (emData && emData.length > 0) setEmails(emData.map(mapEmailFromDb));
      }
    } catch (e) {
      console.warn('Could not fetch from Supabase tables yet. Using local state.');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setActiveProject = (p: Project) => {
    setActiveProjectState(p);
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      hash: generateHash(`${action}:${entityId}:${Date.now()}`),
    };
    setAuditLogs(prev => [newLog, ...prev]);

    safeDb(supabase.from('audit_logs').insert(mapAuditLogToDb(newLog)));
  };

  const sendSlackAlert = (
    text: string,
    badge?: string,
    badgeColor: any = 'blue',
    actionLabel?: string,
    actionView?: string,
    actionPayload?: string
  ) => {
    const newAlert: SlackAlert = {
      id: `slk-${Date.now()}`,
      channel: '#scope-and-contract-ops',
      timestamp: 'Just now',
      sender: 'ScopeLock Bot',
      senderAvatar: '⚡',
      text,
      badge,
      badgeColor,
      actionLabel,
      actionView,
      actionPayload,
    };
    setSlackAlerts(prev => [newAlert, ...prev]);

    safeDb(supabase.from('slack_alerts').insert(mapSlackAlertToDb(newAlert)));
  };

  const markEmailAsRead = (id: string) => {
    setEmails(prev => prev.map(e => (e.id === id ? { ...e, read: true } : e)));
    safeDb(supabase.from('emails').update({ read: true }).eq('id', id));
  };

  const createProject = (data: Partial<Project>): Project => {
    const code = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    const newProjId = `prj-${Date.now()}`;
    const initialScopeVersionId = `scope-${Date.now()}`;

    const newProject: Project = {
      id: newProjId,
      code,
      name: data.name || 'Untitled Enterprise Initiative',
      clientName: data.clientName || 'Stakeholder Client',
      clientEmail: data.clientEmail || 'client@example.com',
      clientOrg: data.clientOrg || 'Client Organization Inc.',
      description: data.description || 'Enterprise platform engineering engagement.',
      pricingModel: data.pricingModel || 'FIXED_PRICE',
      hourlyRate: data.hourlyRate || 175,
      baseBudget: data.baseBudget || 150000,
      currentBudget: data.baseBudget || 150000,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      baseDeliveryDate: data.baseDeliveryDate || '2027-01-31',
      currentDeliveryDate: data.baseDeliveryDate || '2027-01-31',
      status: 'DRAFT',
      activeScopeVersionId: initialScopeVersionId,
      complianceRate: 100,
    };

    const initialScope: ScopeVersion = {
      id: initialScopeVersionId,
      projectId: newProjId,
      version: 'v1.0',
      title: 'Initial Baseline Scope',
      description: 'Initial scoped requirements defined during project kickoff.',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      status: 'DRAFT',
      totalEffortHours: 0,
    };

    setProjects(prev => [newProject, ...prev]);
    setScopeVersions(prev => [...prev, initialScope]);
    setActiveProjectState(newProject);

    safeDb(supabase.from('projects').insert(mapProjectToDb(newProject)));
    safeDb(supabase.from('scope_versions').insert(mapScopeVersionToDb(initialScope)));

    addAuditLog(
      'PROJECT_CREATED',
      'PROJECT',
      newProject.code,
      `Project "${newProject.name}" created with ${newProject.pricingModel} pricing model ($${newProject.baseBudget.toLocaleString()}).`
    );

    sendSlackAlert(
      `🚀 *New Project Created*: *${newProject.name}* (${newProject.code}) for client *${newProject.clientOrg}*. Baseline scope initialized as *v1.0*.`,
      'NEW PROJECT',
      'blue',
      'View Scope',
      'scope',
      initialScopeVersionId
    );

    return newProject;
  };

  const addRequirement = (reqData: Omit<Requirement, 'id' | 'code'>): Requirement => {
    const projectReqs = requirements.filter(r => r.scopeVersionId === reqData.scopeVersionId);
    const codeNum = projectReqs.length + 1;
    const code = reqData.isInScope ? `REQ-${100 + codeNum}` : `REQ-OOS-${codeNum < 10 ? '0' + codeNum : codeNum}`;

    const newReq: Requirement = {
      id: `req-${Date.now()}`,
      code,
      ...reqData,
    };

    setRequirements(prev => [...prev, newReq]);

    setScopeVersions(prev =>
      prev.map(sv => {
        if (sv.id === reqData.scopeVersionId && reqData.isInScope) {
          const updatedSv = { ...sv, totalEffortHours: sv.totalEffortHours + (reqData.estimatedEffort || 0) };
          safeDb(supabase.from('scope_versions').update({ total_effort_hours: updatedSv.totalEffortHours }).eq('id', sv.id));
          return updatedSv;
        }
        return sv;
      })
    );

    safeDb(supabase.from('requirements').insert(mapRequirementToDb(newReq)));

    addAuditLog(
      'REQUIREMENT_ADDED',
      'REQUIREMENT',
      code,
      `Added requirement [${code}] "${newReq.title}" (${newReq.isInScope ? 'IN-SCOPE' : 'OUT-OF-SCOPE'}). Estimated: ${newReq.estimatedEffort}h.`
    );

    return newReq;
  };

  const updateRequirement = (id: string, data: Partial<Requirement>) => {
    setRequirements(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, ...data };
          safeDb(supabase.from('requirements').update(mapRequirementToDb(updated)).eq('id', id));
          addAuditLog(
            'REQUIREMENT_UPDATED',
            'REQUIREMENT',
            r.code,
            `Requirement ${r.code} modified: ${data.title || 'details updated'}.`
          );
          return updated;
        }
        return r;
      })
    );
  };

  const toggleRequirementInScope = (id: string, reason?: string) => {
    setRequirements(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newIsInScope = !r.isInScope;
          const newReason = newIsInScope ? undefined : (reason || 'Deemed out-of-scope for current phase.');
          const updated: Requirement = {
            ...r,
            isInScope: newIsInScope,
            outOfScopeReason: newReason,
          };
          safeDb(supabase.from('requirements').update(mapRequirementToDb(updated)).eq('id', id));
          addAuditLog(
            'SCOPE_BOUNDARY_CHANGED',
            'REQUIREMENT',
            r.code,
            `Requirement ${r.code} changed to ${newIsInScope ? 'IN-SCOPE' : 'OUT-OF-SCOPE'}. Reason: ${newReason || 'Scope refinement'}`
          );
          return updated;
        }
        return r;
      })
    );
  };

  const createScopeVersion = (title: string, desc: string): ScopeVersion => {
    const currentVersions = scopeVersions.filter(sv => sv.projectId === activeProject.id);
    const nextVerNumber = `v1.${currentVersions.length}`;

    setScopeVersions(prev =>
      prev.map(sv => (sv.projectId === activeProject.id ? { ...sv, status: 'SUPERSEDED' } : sv))
    );
    safeDb(supabase.from('scope_versions').update({ status: 'SUPERSEDED' }).eq('project_id', activeProject.id));

    const newScopeVersion: ScopeVersion = {
      id: `scope-${Date.now()}`,
      projectId: activeProject.id,
      version: nextVerNumber,
      title,
      description: desc,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      status: 'APPROVED',
      totalEffortHours: 0,
    };

    setScopeVersions(prev => [...prev, newScopeVersion]);
    safeDb(supabase.from('scope_versions').insert(mapScopeVersionToDb(newScopeVersion)));

    const activeReqs = requirements.filter(
      r => r.scopeVersionId === activeProject.activeScopeVersionId
    );
    const clonedReqs = activeReqs.map(r => ({
      ...r,
      id: `req-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      scopeVersionId: newScopeVersion.id,
    }));
    setRequirements(prev => [...prev, ...clonedReqs]);
    if (clonedReqs.length > 0) {
      safeDb(supabase.from('requirements').insert(clonedReqs.map(mapRequirementToDb)));
    }

    setProjects(prev =>
      prev.map(p =>
        p.id === activeProject.id ? { ...p, activeScopeVersionId: newScopeVersion.id } : p
      )
    );
    setActiveProjectState(prev => ({
      ...prev,
      activeScopeVersionId: newScopeVersion.id,
    }));
    safeDb(supabase.from('projects').update({ active_scope_version_id: newScopeVersion.id }).eq('id', activeProject.id));

    addAuditLog(
      'SCOPE_VERSION_CREATED',
      'SCOPE',
      newScopeVersion.version,
      `New scope baseline ${newScopeVersion.version} created and activated.`
    );

    return newScopeVersion;
  };

  const submitChangeRequest = (
    crData: Omit<ChangeRequest, 'id' | 'crNumber' | 'status' | 'submittedAt'>
  ): ChangeRequest => {
    const crCount = changeRequests.filter(cr => cr.projectId === crData.projectId).length + 1;
    const crNumber = `CR-${crCount < 10 ? '00' + crCount : crCount < 100 ? '0' + crCount : crCount}`;

    const newCR: ChangeRequest = {
      ...crData,
      id: `cr-${Date.now()}`,
      crNumber,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      requestedBy: crData.requestedBy || currentUser.name,
      requestedRole: crData.requestedRole || currentUser.role,
    };

    setChangeRequests(prev => [newCR, ...prev]);
    safeDb(supabase.from('change_requests').insert(mapChangeRequestToDb(newCR)));

    addAuditLog(
      'CHANGE_REQUEST_SUBMITTED',
      'CHANGE_REQUEST',
      crNumber,
      `CR ${crNumber} "${newCR.title}" submitted by ${currentUser.name}. Impact: +${newCR.effortImpactHours}h, +${newCR.scheduleImpactDays}d, +$${newCR.costImpact.toLocaleString()}.`
    );

    sendSlackAlert(
      `🚨 *New Change Request Logged*: *${crNumber}* ("${newCR.title}"). Classification: *${newCR.classification === 'ADDITIONAL_SCOPE' ? 'Additional Scope' : 'Original Scope'}*. Schedule impact: *+${newCR.scheduleImpactDays} days*, Cost: *+$${newCR.costImpact.toLocaleString()}*. Requires Client Formal Approval.`,
      'APPROVAL PENDING',
      'amber',
      `Review ${crNumber}`,
      'changeRequests',
      newCR.id
    );

    const newEmail: EmailNotification = {
      id: `em-${Date.now()}`,
      from: 'system@scopelock.dev',
      to: activeProject.clientEmail,
      subject: `Action Required: Formal Review for ${crNumber} - ${newCR.title}`,
      preview: `Change Request ${crNumber} has been submitted with +${newCR.scheduleImpactDays} days schedule and +$${newCR.costImpact} cost impact.`,
      body: `Hello ${activeProject.clientName},\n\nA new Change Request (${crNumber}) has been logged for "${activeProject.name}".\n\nTitle: ${newCR.title}\nJustification: ${newCR.reason}\nImpact on Effort: +${newCR.effortImpactHours} hours\nImpact on Schedule: +${newCR.scheduleImpactDays} days\nImpact on Cost: +$${newCR.costImpact.toLocaleString()}\n\nIn accordance with scope governance, implementation cannot begin until you review and formally approve or reject this request.`,
      timestamp: 'Just now',
      read: false,
      type: 'CR_SUBMISSION',
    };
    setEmails(prev => [newEmail, ...prev]);
    safeDb(supabase.from('emails').insert(mapEmailToDb(newEmail)));

    return newCR;
  };

  const approveChangeRequest = (crId: string, comments?: string) => {
    const targetCr = changeRequests.find(cr => cr.id === crId);
    if (!targetCr) return;

    const parentProject = projects.find(p => p.id === targetCr.projectId) || activeProject;

    const baseDate = new Date(parentProject.currentDeliveryDate || '2026-12-15');
    baseDate.setDate(baseDate.getDate() + (targetCr.scheduleImpactDays || 0));
    const updatedDeliveryDate = baseDate.toISOString().split('T')[0];
    const updatedBudget = parentProject.currentBudget + (targetCr.costImpact || 0);

    const addendumNumber = `ADDENDUM-${Math.floor(10 + Math.random() * 90)}-${targetCr.crNumber}`;
    const addendumContractId = `ctr-addendum-${Date.now()}`;

    const addendumContract: Contract = {
      id: addendumContractId,
      contractNumber: addendumNumber,
      projectId: parentProject.id,
      scopeVersionId: parentProject.activeScopeVersionId,
      title: `Contract Addendum for ${targetCr.crNumber}: ${targetCr.title}`,
      humanizedTitle: `Scope Expansion & Schedule Update Letter (${targetCr.crNumber}: ${targetCr.title})`,
      contractType: 'ADDENDUM',
      parentContractId: 'ctr-001',
      relatedCrId: targetCr.id,
      documentSummary: `Legally binding Addendum amending Master Agreement to incorporate ${targetCr.crNumber}. Schedule adjusted by +${targetCr.scheduleImpactDays} calendar days; aggregate fees adjusted by +$${targetCr.costImpact.toLocaleString()}.`,
      humanizedSummary: `Collaborative addendum formally expanding project scope with ${targetCr.crNumber} (${targetCr.title}), dedicating ${targetCr.effortImpactHours} hours, shifting release target by ${targetCr.scheduleImpactDays} days, and adjusting investment by +$${targetCr.costImpact.toLocaleString()}.`,
      greetingLetter: `Dear ${parentProject.clientName} and the ${parentProject.clientOrg} Team,\n\nWe are pleased to confirm your team's requested additions for ${targetCr.title}. Below is our transparent schedule and investment adjustment so we can proceed with full alignment and quality.`,
      effectiveDate: new Date().toISOString().split('T')[0],
      deliveryDate: updatedDeliveryDate,
      signingStatus: 'SENT_FOR_SIGNATURE',
      pricingTerms: {
        baseAmount: targetCr.costImpact,
        paymentMilestones: [
          {
            id: `ms-add-${Date.now()}`,
            name: `Milestone: Completion of ${targetCr.crNumber}`,
            amount: targetCr.costImpact,
            dueDate: updatedDeliveryDate,
            status: 'PENDING',
          },
        ],
      },
      clauses: [
        {
          id: `cl-add-1-${Date.now()}`,
          title: `Article 1: Scope Incorporation (${targetCr.crNumber})`,
          humanizedTitle: `Article 1: Scope Expansion (${targetCr.title})`,
          category: 'SCOPE',
          content: `This Addendum formally incorporates the scope of ${targetCr.crNumber} ("${targetCr.title}") into the project baseline. Effort allocation authorized: ${targetCr.effortImpactHours} hours.`,
          humanizedContent: `We are formally adding the deliverables of ${targetCr.crNumber} ("${targetCr.title}") to our active project baseline. Our engineering team is dedicating ${targetCr.effortImpactHours} hours to build, review, and test this feature thoroughly.`,
          originalContent: `This Addendum formally incorporates the scope of ${targetCr.crNumber} ("${targetCr.title}") into the project baseline. Effort allocation authorized: ${targetCr.effortImpactHours} hours.`,
          isRedlined: false,
        },
        {
          id: `cl-add-2-${Date.now()}`,
          title: 'Article 2: Recalculated Delivery Schedule',
          humanizedTitle: 'Article 2: Thoughtful Schedule Adjustment',
          category: 'CHANGE_CONTROL',
          content: `In accordance with Section 2 of Master Agreement, the project delivery deadline is hereby recalculated from ${parentProject.currentDeliveryDate} to ${updatedDeliveryDate} (+${targetCr.scheduleImpactDays} days).`,
          humanizedContent: `To ensure thorough quality testing without rushing, our target delivery date shifts by ${targetCr.scheduleImpactDays} calendar days—moving from ${parentProject.currentDeliveryDate} to ${updatedDeliveryDate}.`,
          originalContent: `In accordance with Section 2 of Master Agreement, the project delivery deadline is hereby recalculated from ${parentProject.currentDeliveryDate} to ${updatedDeliveryDate} (+${targetCr.scheduleImpactDays} days).`,
          isRedlined: false,
        },
        {
          id: `cl-add-3-${Date.now()}`,
          title: 'Article 3: Fee Adjustment & Milestones',
          humanizedTitle: 'Article 3: Transparent Investment Adjustment',
          category: 'PAYMENT',
          content: `Contract fee is adjusted upward by $${targetCr.costImpact.toLocaleString()} bringing total committed budget to $${updatedBudget.toLocaleString()}.`,
          humanizedContent: `The total agreed investment is adjusted by +$${targetCr.costImpact.toLocaleString()}, bringing the revised aggregate project budget to $${updatedBudget.toLocaleString()}, billed upon milestone delivery signoff.`,
          originalContent: `Contract fee is adjusted upward by $${targetCr.costImpact.toLocaleString()} bringing total committed budget to $${updatedBudget.toLocaleString()}.`,
          isRedlined: false,
        },
      ],
      clientSigner: {
        name: parentProject.clientName,
        email: parentProject.clientEmail,
        title: 'Authorized Client Signer',
        organization: parentProject.clientOrg,
      },
      vendorSigner: {
        name: 'Alex Mercer',
        email: 'alex.mercer@scopelock.dev',
        title: 'Managing Principal',
        organization: 'ScopeLock Engineering Services',
        signedDate: new Date().toISOString(),
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="Caveat, cursive" font-size="28" fill="%231e293b">Alex Mercer</text></svg>',
        ipAddress: '203.0.113.19',
      },
    };

    setContracts(prev => [addendumContract, ...prev]);
    safeDb(supabase.from('contracts').insert(mapContractToDb(addendumContract)));

    const updatedCr: ChangeRequest = {
      ...targetCr,
      status: 'CLIENT_APPROVED' as CRStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.name,
      reviewComments: comments || 'Formally approved by authorized client signer.',
      addendumContractId,
    };
    setChangeRequests(prev => prev.map(cr => (cr.id === crId ? updatedCr : cr)));
    safeDb(supabase.from('change_requests').update(mapChangeRequestToDb(updatedCr)).eq('id', crId));

    const updatedProject: Project = {
      ...parentProject,
      currentBudget: updatedBudget,
      currentDeliveryDate: updatedDeliveryDate,
    };

    setProjects(prev => prev.map(p => (p.id === parentProject.id ? updatedProject : p)));
    if (activeProject.id === parentProject.id) {
      setActiveProjectState(updatedProject);
    }
    safeDb(supabase.from('projects').update(mapProjectToDb(updatedProject)).eq('id', parentProject.id));

    if (targetCr.newRequirementData) {
      const code = `REQ-${200 + Math.floor(Math.random() * 50)}`;
      const newReq: Requirement = {
        id: `req-${Date.now()}`,
        code,
        scopeVersionId: parentProject.activeScopeVersionId,
        title: targetCr.newRequirementData.title,
        description: targetCr.newRequirementData.description,
        category: targetCr.newRequirementData.category,
        priority: 'HIGH',
        estimatedEffort: targetCr.effortImpactHours,
        acceptanceCriteria: targetCr.newRequirementData.acceptanceCriteria,
        isInScope: true,
        status: 'ADDED_BY_CR',
        sourceCrId: targetCr.id,
      };
      setRequirements(prev => [...prev, newReq]);
      safeDb(supabase.from('requirements').insert(mapRequirementToDb(newReq)));
    } else if (targetCr.targetRequirementId) {
      setRequirements(prev =>
        prev.map(r => {
          if (r.id === targetCr.targetRequirementId) {
            const modReq = { ...r, status: 'MODIFIED_BY_CR' as const, sourceCrId: targetCr.id };
            safeDb(supabase.from('requirements').update(mapRequirementToDb(modReq)).eq('id', r.id));
            return modReq;
          }
          return r;
        })
      );
    }

    addAuditLog(
      'CR_APPROVED_AND_ADDENDUM_GENERATED',
      'CHANGE_REQUEST',
      targetCr.crNumber,
      `CR ${targetCr.crNumber} approved by ${currentUser.name}. Generated Addendum "${addendumNumber}". Project deadline adjusted to ${updatedDeliveryDate}, budget updated to $${updatedBudget.toLocaleString()}.`
    );

    sendSlackAlert(
      `✅ *Change Request Approved*: *${targetCr.crNumber}* has been approved by *${currentUser.name}*. Generated Addendum *${addendumNumber}*. Deadline shifted to *${updatedDeliveryDate}* (+${targetCr.scheduleImpactDays}d), Budget: *+$${targetCr.costImpact.toLocaleString()}*.`,
      'ADDENDUM READY',
      'emerald',
      'E-Sign Addendum',
      'contracts',
      addendumContractId
    );

    const newEmail: EmailNotification = {
      id: `em-${Date.now()}`,
      from: 'contracts@scopelock.dev',
      to: parentProject.clientEmail,
      subject: `Contract Addendum ${addendumNumber} Ready for E-Signature (${targetCr.crNumber})`,
      preview: `Addendum ${addendumNumber} for ${targetCr.title} is waiting for your digital signature.`,
      body: `Hello ${parentProject.clientName},\n\nFollowing the formal approval of ${targetCr.crNumber}, Contract Addendum ${addendumNumber} has been automatically generated and is ready for execution.\n\n• Revised Project Completion Date: ${updatedDeliveryDate}\n• Revised Project Total Budget: $${updatedBudget.toLocaleString()}\n\nPlease execute the digital signature to finalize the agreement. Work on this change will start once executed.`,
      timestamp: 'Just now',
      read: false,
      type: 'CR_APPROVAL',
    };
    setEmails(prev => [newEmail, ...prev]);
    safeDb(supabase.from('emails').insert(mapEmailToDb(newEmail)));
  };

  const rejectChangeRequest = (crId: string, comments: string) => {
    const targetCr = changeRequests.find(cr => cr.id === crId);
    if (!targetCr) return;

    const updatedCr: ChangeRequest = {
      ...targetCr,
      status: 'REJECTED' as CRStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.name,
      reviewComments: comments,
    };
    setChangeRequests(prev => prev.map(cr => (cr.id === crId ? updatedCr : cr)));
    safeDb(supabase.from('change_requests').update(mapChangeRequestToDb(updatedCr)).eq('id', crId));

    addAuditLog(
      'CR_REJECTED',
      'CHANGE_REQUEST',
      targetCr.crNumber,
      `CR ${targetCr.crNumber} rejected by ${currentUser.name}. Baseline preserved without schedule or budget drift. Rationale: ${comments}`
    );

    sendSlackAlert(
      `❌ *Change Request Rejected*: *${targetCr.crNumber}* ("${targetCr.title}") was rejected by *${currentUser.name}*. Baseline project schedule and budget remain unaltered.`,
      'REJECTED',
      'rose',
      'View CR',
      'changeRequests',
      targetCr.id
    );
  };

  const generateContractFromScope = (
    scopeVersionId: string,
    contractType: ContractType,
    customTitle?: string
  ): Contract => {
    const scopeVer = scopeVersions.find(sv => sv.id === scopeVersionId);
    const scopeReqs = requirements.filter(r => r.scopeVersionId === scopeVersionId && r.isInScope);
    const oosReqs = requirements.filter(r => r.scopeVersionId === scopeVersionId && !r.isInScope);

    const contractNumber = `CTR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newContract: Contract = {
      id: `ctr-${Date.now()}`,
      contractNumber,
      projectId: activeProject.id,
      scopeVersionId,
      title: customTitle || `${contractType === 'MSA' ? 'Master Services Agreement & SOW' : contractType} (${scopeVer?.version || 'v1.0'})`,
      contractType,
      documentSummary: `Comprehensive ${contractType} agreement defining ${scopeReqs.length} In-Scope deliverables and ${oosReqs.length} Out-of-Scope boundary conditions for project ${activeProject.name}.`,
      effectiveDate: activeProject.startDate,
      deliveryDate: activeProject.currentDeliveryDate,
      signingStatus: 'DRAFT',
      pricingTerms: {
        baseAmount: activeProject.baseBudget,
        ratePerHour: activeProject.pricingModel === 'TIME_AND_MATERIALS' ? activeProject.hourlyRate : undefined,
        paymentMilestones: [
          {
            id: `ms-gen-1`,
            name: 'Initial Retainer & Architecture Signoff (30%)',
            amount: Math.round(activeProject.baseBudget * 0.3),
            dueDate: activeProject.startDate,
            status: 'PENDING',
          },
          {
            id: `ms-gen-2`,
            name: 'Midpoint Engineering Sprint Delivery (40%)',
            amount: Math.round(activeProject.baseBudget * 0.4),
            dueDate: '2026-11-15',
            status: 'PENDING',
          },
          {
            id: `ms-gen-3`,
            name: 'Final Acceptance & Production Handover (30%)',
            amount: Math.round(activeProject.baseBudget * 0.3),
            dueDate: activeProject.currentDeliveryDate,
            status: 'PENDING',
          },
        ],
      },
      clauses: [
        {
          id: `cl-${Date.now()}-1`,
          title: 'Section 1: Scope of Deliverables & Requirements Boundary',
          category: 'SCOPE',
          content: `Vendor warrants to deliver the software strictly according to Scope Document ${scopeVer?.version || 'v1.0'} comprising ${scopeReqs.length} enumerated In-Scope items. Any features not contained therein are expressly designated Out-of-Scope.`,
          originalContent: `Vendor warrants to deliver the software strictly according to Scope Document ${scopeVer?.version || 'v1.0'} comprising ${scopeReqs.length} enumerated In-Scope items. Any features not contained therein are expressly designated Out-of-Scope.`,
          isRedlined: false,
        },
        {
          id: `cl-${Date.now()}-2`,
          title: 'Section 2: Formal Scope & Change Management Protocol',
          category: 'CHANGE_CONTROL',
          content: 'No additions, deletions, or modifications to the Scope shall be recognized or implemented unless submitted via a formal Change Request (CR) and executed as a signed Addendum specifying schedule and cost impacts.',
          originalContent: 'No additions, deletions, or modifications to the Scope shall be recognized or implemented unless submitted via a formal Change Request (CR) and executed as a signed Addendum specifying schedule and cost impacts.',
          isRedlined: false,
        },
        {
          id: `cl-${Date.now()}-3`,
          title: 'Section 3: Payment Model & Billing Schedules',
          category: 'PAYMENT',
          content: `Services shall be billed on a ${activeProject.pricingModel === 'FIXED_PRICE' ? 'Fixed-Price milestone basis totaling $' + activeProject.baseBudget.toLocaleString() : 'Time & Materials basis at $' + activeProject.hourlyRate + '/hr'}. Invoices are payable net 30 days from date of milestone acceptance.`,
          originalContent: `Services shall be billed on a ${activeProject.pricingModel === 'FIXED_PRICE' ? 'Fixed-Price milestone basis totaling $' + activeProject.baseBudget.toLocaleString() : 'Time & Materials basis at $' + activeProject.hourlyRate + '/hr'}. Invoices are payable net 30 days from date of milestone acceptance.`,
          isRedlined: false,
        },
        {
          id: `cl-${Date.now()}-4`,
          title: 'Section 4: Intellectual Property & Source Code Ownership',
          category: 'IP',
          content: 'All bespoke source code, database architectures, and API specifications developed for Client under this Statement of Work shall transfer irrevocably to Client upon final payment.',
          originalContent: 'All bespoke source code, database architectures, and API specifications developed for Client under this Statement of Work shall transfer irrevocably to Client upon final payment.',
          isRedlined: false,
        },
      ],
      clientSigner: {
        name: activeProject.clientName,
        email: activeProject.clientEmail,
        title: 'Executive Client Sponsor',
        organization: activeProject.clientOrg,
      },
      vendorSigner: {
        name: 'Alex Mercer',
        email: 'alex.mercer@scopelock.dev',
        title: 'Managing Principal',
        organization: 'ScopeLock Engineering Services',
        signedDate: new Date().toISOString(),
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="Caveat, cursive" font-size="28" fill="%231e293b">Alex Mercer</text></svg>',
        ipAddress: '203.0.113.19',
      },
    };

    setContracts(prev => [newContract, ...prev]);
    safeDb(supabase.from('contracts').insert(mapContractToDb(newContract)));

    addAuditLog(
      'CONTRACT_DRAFT_GENERATED',
      'CONTRACT',
      contractNumber,
      `Generated ${contractType} draft "${newContract.title}" from Scope Version ${scopeVer?.version || 'v1.0'}.`
    );

    sendSlackAlert(
      `📝 *Contract Generated from Scope*: *${contractNumber}* generated for *${activeProject.name}*. Ready for clause redlining and e-signature dispatch.`,
      'CONTRACT DRAFT',
      'blue',
      'Open Contract',
      'contracts',
      newContract.id
    );

    return newContract;
  };

  const updateContractClause = (
    contractId: string,
    clauseId: string,
    content: string,
    note?: string
  ) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id === contractId) {
          const updatedClauses = c.clauses.map(clause => {
            if (clause.id === clauseId) {
              const isModified = content !== clause.originalContent;
              return {
                ...clause,
                content,
                isRedlined: isModified,
                redlineNote: note || (isModified ? `Modified by ${currentUser.name}` : undefined),
              };
            }
            return clause;
          });
          const updatedContract = { ...c, clauses: updatedClauses };
          safeDb(supabase.from('contracts').update(mapContractToDb(updatedContract)).eq('id', contractId));
          return updatedContract;
        }
        return c;
      })
    );

    addAuditLog(
      'CLAUSE_REDLINED',
      'CLAUSE',
      clauseId,
      `Contract clause redlined by ${currentUser.name} (${currentUser.role}). Note: ${note || 'Modified terms'}`
    );
  };

  const signContract = (
    contractId: string,
    signerType: 'client' | 'vendor',
    signatureDataUrl: string,
    signerName: string
  ) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id === contractId) {
          const now = new Date().toISOString();
          const isClient = signerType === 'client';
          const updatedClientSigner = isClient
            ? {
                ...c.clientSigner,
                name: signerName || c.clientSigner.name,
                signedDate: now,
                signatureDataUrl,
                ipAddress: '198.51.100.42',
              }
            : c.clientSigner;

          const updatedVendorSigner = !isClient
            ? {
                ...c.vendorSigner,
                name: signerName || c.vendorSigner.name,
                signedDate: now,
                signatureDataUrl,
                ipAddress: '203.0.113.19',
              }
            : c.vendorSigner;

          const isFullyExecuted =
            Boolean(updatedClientSigner.signedDate) && Boolean(updatedVendorSigner.signedDate);

          const certificate = isFullyExecuted
            ? {
                certificateId: `CERT-DOCU-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
                sha256Hash: generateHash(`${c.contractNumber}:${now}:tamper-evident`),
                timestamp: now,
                tamperEvidentStatus: 'VALID' as const,
              }
            : c.certificate;

          const updatedContract: Contract = {
            ...c,
            clientSigner: updatedClientSigner,
            vendorSigner: updatedVendorSigner,
            signingStatus: isFullyExecuted
              ? 'FULLY_EXECUTED'
              : isClient
              ? 'CLIENT_SIGNED'
              : 'SENT_FOR_SIGNATURE',
            certificate,
          };

          safeDb(supabase.from('contracts').update(mapContractToDb(updatedContract)).eq('id', contractId));
          return updatedContract;
        }
        return c;
      })
    );

    addAuditLog(
      'CONTRACT_SIGNED',
      'SIGNATURE',
      contractId,
      `Contract ${contractId} digitally signed by ${signerName} (${signerType.toUpperCase()}) with cryptographic certificate stamp.`
    );

    sendSlackAlert(
      `✍️ *Digital Signature Executed*: Contract *${contractId}* was signed by *${signerName}*. Legal audit certificate generated.`,
      'SIGNED',
      'emerald',
      'Inspect Contract',
      'contracts',
      contractId
    );
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        availableUsers: MOCK_USERS,
        projects,
        activeProject,
        setActiveProject,
        scopeVersions,
        requirements,
        changeRequests,
        contracts,
        auditLogs,
        slackAlerts,
        emails,
        activeTab,
        setActiveTab,
        selectedContractId,
        setSelectedContractId,
        selectedCrId,
        setSelectedCrId,
        supabaseStatus,
        loadFromSupabase,
        createProject,
        addRequirement,
        updateRequirement,
        toggleRequirementInScope,
        createScopeVersion,
        submitChangeRequest,
        approveChangeRequest,
        rejectChangeRequest,
        generateContractFromScope,
        updateContractClause,
        signContract,
        addAuditLog,
        sendSlackAlert,
        markEmailAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
