import { useEffect, useState } from 'react'
import {
  Award,
  Clock,
  Download,
  FileText,
  Info,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Upload,
  User,
  X,
} from 'lucide-react'
import { Alert } from '../../components/common/Alert'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { TextField } from '../../components/common/TextField'
import { useAuth } from '../../context/useAuth'
import { familyService } from '../../services/api'

const statusTones = {
  PENDING: 'warning',
  ASSIGNED: 'navy',
  IN_PROGRESS: 'navy',
  RESOLVED: 'success',
  REJECTED: 'danger',
}

const priorityTones = {
  LOW: 'muted',
  MEDIUM: 'navy',
  HIGH: 'warning',
  URGENT: 'danger',
}

const CATEGORIES = [
  'Financial Assistance',
  'Pension & Benefits',
  'Medical / Healthcare',
  'Children Education',
  'Legal & Administrative Aid',
  'Housing & Rehabilitation',
  'Other Support',
]

const PRIORITIES = [
  { value: 'LOW', label: 'Low — General inquiry' },
  { value: 'MEDIUM', label: 'Medium — Normal assistance' },
  { value: 'HIGH', label: 'High — Time-sensitive need' },
  { value: 'URGENT', label: 'Urgent — Immediate emergency' },
]

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']

export function FamilyDashboard() {
  const { email } = useAuth()
  const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'documents' | 'profile'

  // Profile State
  const [profile, setProfile] = useState(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileForm, setProfileForm] = useState({
    phoneNumber: '',
    address: '',
    serviceDetails: '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  // Support Requests State
  const [requests, setRequests] = useState([])
  const [isRequestsLoading, setIsRequestsLoading] = useState(true)
  const [requestsError, setRequestsError] = useState('')
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false)
  const [requestForm, setRequestForm] = useState({
    category: CATEGORIES[0],
    priority: 'MEDIUM',
    description: '',
  })
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [newRequestError, setNewRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')

  // Documents State
  const [documents, setDocuments] = useState([])
  const [isDocsLoading, setIsDocsLoading] = useState(true)
  const [docsError, setDocsError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [downloadingDocId, setDownloadingDocId] = useState(null)

  // ---------------------------------------------------------------------------
  // Data Loaders
  // ---------------------------------------------------------------------------
  async function loadProfile() {
    setIsProfileLoading(true)
    setProfileError('')
    try {
      const data = await familyService.getProfile()
      setProfile(data)
      setProfileNotFound(false)
    } catch (err) {
      if (err.status === 404) {
        setProfileNotFound(true)
        setProfile(null)
      } else {
        setProfileError(err.message || 'Failed to load family profile.')
      }
    } finally {
      setIsProfileLoading(false)
    }
  }

  async function loadRequests() {
    setIsRequestsLoading(true)
    setRequestsError('')
    try {
      const data = await familyService.getRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setRequestsError(err.message || 'Failed to load support requests.')
    } finally {
      setIsRequestsLoading(false)
    }
  }

  async function loadDocuments() {
    setIsDocsLoading(true)
    setDocsError('')
    try {
      const data = await familyService.getDocuments()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      setDocsError(err.message || 'Failed to load documents.')
    } finally {
      setIsDocsLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    familyService.getProfile()
      .then((data) => {
        if (active) {
          setProfile(data)
          setProfileNotFound(false)
        }
      })
      .catch((err) => {
        if (active) {
          if (err.status === 404) {
            setProfileNotFound(true)
            setProfile(null)
          } else {
            setProfileError(err.message || 'Failed to load family profile.')
          }
        }
      })
      .finally(() => {
        if (active) setIsProfileLoading(false)
      })

    familyService.getRequests()
      .then((data) => {
        if (active) setRequests(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) setRequestsError(err.message || 'Failed to load support requests.')
      })
      .finally(() => {
        if (active) setIsRequestsLoading(false)
      })

    familyService.getDocuments()
      .then((data) => {
        if (active) setDocuments(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) setDocsError(err.message || 'Failed to load documents.')
      })
      .finally(() => {
        if (active) setIsDocsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Profile Handlers
  // ---------------------------------------------------------------------------
  async function handleCreateProfile(e) {
    e.preventDefault()
    if (!profileForm.phoneNumber.trim() || !profileForm.address.trim()) {
      setProfileError('Please provide both phone number and permanent address.')
      return
    }

    setIsSavingProfile(true)
    setProfileError('')

    try {
      const created = await familyService.createProfile(profileForm)
      setProfile(created)
      setProfileNotFound(false)
      setProfileSuccess('Family profile successfully registered.')
    } catch (err) {
      setProfileError(err.message || 'Failed to register family profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Support Request Handlers
  // ---------------------------------------------------------------------------
  async function handleCreateRequest(e) {
    e.preventDefault()
    if (!requestForm.description.trim()) {
      setNewRequestError('Please provide a description of the assistance needed.')
      return
    }

    setIsSubmittingRequest(true)
    setNewRequestError('')

    try {
      await familyService.createRequest(requestForm)
      setRequestSuccess('Support request submitted successfully. A volunteer will be assigned.')
      setIsNewRequestModalOpen(false)
      setRequestForm({
        category: CATEGORIES[0],
        priority: 'MEDIUM',
        description: '',
      })
      await loadRequests()
    } catch (err) {
      setNewRequestError(err.message || 'Failed to submit support request.')
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Document Handlers
  // ---------------------------------------------------------------------------
  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    setUploadError('')
    setUploadSuccess('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('File exceeds 5 MB maximum size limit.')
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    // Type check by extension and mime
    const lowerName = file.name.toLowerCase()
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
    const hasAllowedMime = ALLOWED_MIME_TYPES.includes(file.type)

    if (!hasAllowedExt && !hasAllowedMime) {
      setUploadError('Only PDF, JPG/JPEG, and PNG documents are allowed.')
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  async function handleUploadDoc(e) {
    e.preventDefault()
    if (!selectedFile) {
      setUploadError('Please select a valid document to upload.')
      return
    }

    setIsUploadingDoc(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      await familyService.uploadDocument(selectedFile)
      setUploadSuccess(`Document "${selectedFile.name}" uploaded successfully.`)
      setSelectedFile(null)
      const fileInput = document.getElementById('doc-file-input')
      if (fileInput) fileInput.value = ''
      await loadDocuments()
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.')
    } finally {
      setIsUploadingDoc(false)
    }
  }

  async function handleDownloadDoc(doc) {
    setDownloadingDocId(doc.id)
    try {
      await familyService.downloadDocument(doc.id, doc.documentName)
    } catch (err) {
      setDocsError(err.message || 'Failed to download document.')
    } finally {
      setDownloadingDocId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* V1 Boundary Callout */}
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-xs text-muted shadow-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-navy" />
        <div>
          <span className="font-semibold text-navy">Veer Parivaar V1 Family Services:</span> Submit
          welfare requests, manage your profile, and upload certificates. Official defence soldier
          linking and Service ID verification are planned for V2.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'requests'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted hover:text-navy'
          }`}
        >
          <FileText className="size-4" />
          Support Requests
          <Badge tone="navy" className="ml-1">
            {requests.length}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'documents'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted hover:text-navy'
          }`}
        >
          <Upload className="size-4" />
          Verified Documents
          <Badge tone="navy" className="ml-1">
            {documents.length}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === 'profile'
              ? 'border-navy text-navy'
              : 'border-transparent text-muted hover:text-navy'
          }`}
        >
          <User className="size-4" />
          Family Profile
          {profile ? (
            <Badge tone="success" className="ml-1">Active</Badge>
          ) : (
            <Badge tone="warning" className="ml-1">Incomplete</Badge>
          )}
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: SUPPORT REQUESTS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'requests' ? (
        <div className="flex flex-col gap-6">
          {requestSuccess ? (
            <Alert tone="success" title="Success">
              <div className="flex items-center justify-between">
                <span>{requestSuccess}</span>
                <button
                  type="button"
                  onClick={() => setRequestSuccess('')}
                  className="ml-4 text-xs underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            </Alert>
          ) : null}

          {/* Action Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy">My Support Requests</h2>
              <p className="text-xs text-muted">
                Track assistance requested from defence administrators and field volunteers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={loadRequests}
                disabled={isRequestsLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isRequestsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewRequestModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                New Request
              </Button>
            </div>
          </div>

          {/* Requests Content */}
          <Card className="overflow-hidden p-0">
            {requestsError ? (
              <div className="p-6">
                <Alert tone="error" title="Unable to retrieve requests">
                  <div className="flex flex-col gap-2">
                    <span>{requestsError}</span>
                    <Button variant="secondary" size="sm" onClick={loadRequests} className="w-fit">
                      Retry
                    </Button>
                  </div>
                </Alert>
              </div>
            ) : isRequestsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <RefreshCw className="size-8 animate-spin text-navy/40" />
                <p className="mt-3 text-sm font-medium">Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
                <Clock className="size-10 text-muted/40" />
                <p className="mt-3 text-sm font-semibold text-navy">No requests yet</p>
                <p className="mt-1 text-xs text-muted max-w-sm">
                  You have not submitted any support requests. Click "New Request" to ask for medical,
                  pension, education, or welfare assistance.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className="mt-4 gap-1.5"
                >
                  <Plus className="size-4" />
                  Submit Your First Request
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 hover:bg-page/40 transition">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-muted">
                            #{req.id}
                          </span>
                          <span className="text-base font-bold text-navy">
                            {req.category}
                          </span>
                          <Badge tone={priorityTones[req.priority] || 'navy'}>
                            {req.priority}
                          </Badge>
                          <Badge tone={statusTones[req.status] || 'navy'}>
                            {req.status}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-ink whitespace-pre-wrap leading-relaxed">
                          {req.description}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted shrink-0">
                        <p>Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}</p>
                        {req.updatedAt && req.updatedAt !== req.createdAt ? (
                          <p className="mt-0.5 text-[11px]">Updated: {new Date(req.updatedAt).toLocaleDateString()}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* New Request Modal */}
          {isNewRequestModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-navy">New Support Request</h3>
                    <p className="text-xs text-muted">Describe the assistance your family requires</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewRequestModalOpen(false)}
                    className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-navy"
                    disabled={isSubmittingRequest}
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {newRequestError ? (
                  <div className="mt-4">
                    <Alert tone="error" title="Submission Error">
                      {newRequestError}
                    </Alert>
                  </div>
                ) : null}

                <form onSubmit={handleCreateRequest} className="mt-4 flex flex-col gap-4">
                  <div>
                    <label htmlFor="req-category" className="text-sm font-semibold text-navy-secondary">
                      Support Category *
                    </label>
                    <select
                      id="req-category"
                      value={requestForm.category}
                      onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink focus:border-accent"
                      disabled={isSubmittingRequest}
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="req-priority" className="text-sm font-semibold text-navy-secondary">
                      Urgency Level *
                    </label>
                    <select
                      id="req-priority"
                      value={requestForm.priority}
                      onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink focus:border-accent"
                      disabled={isSubmittingRequest}
                      required
                    >
                      {PRIORITIES.map((pri) => (
                        <option key={pri.value} value={pri.value}>
                          {pri.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="req-description" className="text-sm font-semibold text-navy-secondary">
                      Detailed Description *
                    </label>
                    <textarea
                      id="req-description"
                      rows={4}
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="Please describe your specific requirement, relevant dates, or any urgency..."
                      className="mt-1.5 w-full rounded-lg border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                      disabled={isSubmittingRequest}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsNewRequestModalOpen(false)}
                      disabled={isSubmittingRequest}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmittingRequest}
                      className="gap-1.5"
                    >
                      {isSubmittingRequest ? (
                        <>
                          <RefreshCw className="size-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: VERIFIED DOCUMENTS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'documents' ? (
        <div className="flex flex-col gap-6">
          {uploadSuccess ? (
            <Alert tone="success" title="Document Uploaded">
              <div className="flex items-center justify-between">
                <span>{uploadSuccess}</span>
                <button
                  type="button"
                  onClick={() => setUploadSuccess('')}
                  className="ml-4 text-xs underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            </Alert>
          ) : null}

          {/* Upload Card */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-navy">Upload Supporting Document</h2>
            <p className="mt-1 text-xs text-muted">
              Securely upload pension certificates, service records, casualty certificates, or medical bills.
              Only PDF, JPG/JPEG, and PNG formats up to 5 MB are accepted.
            </p>

            {uploadError ? (
              <div className="mt-3">
                <Alert tone="error" title="Upload Validation Error">
                  {uploadError}
                </Alert>
              </div>
            ) : null}

            <form onSubmit={handleUploadDoc} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <input
                  id="doc-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  onChange={handleFileSelect}
                  disabled={isUploadingDoc}
                  className="block w-full text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-navy/10 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-navy hover:file:bg-navy/20 cursor-pointer"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!selectedFile || isUploadingDoc}
                className="gap-1.5 sm:self-auto"
              >
                {isUploadingDoc ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    Upload File
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Documents Table */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-line bg-surface/50 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-navy">My Uploaded Documents</h3>
                <p className="text-xs text-muted">
                  {documents.length} document{documents.length === 1 ? '' : 's'} on record
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadDocuments}
                disabled={isDocsLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isDocsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {docsError ? (
              <div className="p-6">
                <Alert tone="error" title="Failed to load documents">
                  <div className="flex flex-col gap-2">
                    <span>{docsError}</span>
                    <Button variant="secondary" size="sm" onClick={loadDocuments} className="w-fit">
                      Retry
                    </Button>
                  </div>
                </Alert>
              </div>
            ) : isDocsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <RefreshCw className="size-8 animate-spin text-navy/40" />
                <p className="mt-3 text-sm font-medium">Loading uploaded documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
                <FileText className="size-10 text-muted/40" />
                <p className="mt-3 text-sm font-semibold text-navy">No Documents Uploaded</p>
                <p className="mt-1 text-xs text-muted">
                  Use the upload section above to submit supporting family documentation.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-6 py-3.5">Document Name</th>
                      <th className="px-6 py-3.5">Format</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Uploaded Date</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs sm:text-sm">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-page/50 transition">
                        <td className="px-6 py-4 font-medium text-navy">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-muted" />
                            <span>{doc.documentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs uppercase text-muted">
                          {doc.documentType}
                        </td>
                        <td className="px-6 py-4">
                          <Badge tone="success">
                            {doc.status || 'UPLOADED'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted text-xs">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={downloadingDocId === doc.id}
                            onClick={() => handleDownloadDoc(doc)}
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            {downloadingDocId === doc.id ? (
                              <RefreshCw className="size-3.5 animate-spin" />
                            ) : (
                              <Download className="size-3.5" />
                            )}
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: FAMILY PROFILE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'profile' ? (
        <div className="flex flex-col gap-6">
          {profileSuccess ? (
            <Alert tone="success" title="Profile Saved">
              {profileSuccess}
            </Alert>
          ) : null}

          {isProfileLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <RefreshCw className="size-8 animate-spin text-navy/40" />
              <p className="mt-3 text-sm font-medium">Loading family profile details...</p>
            </div>
          ) : profile ? (
            /* Profile Details Display */
            <Card className="p-6">
              <div className="flex items-start justify-between border-b border-line pb-4">
                <div>
                  <h2 className="text-lg font-bold text-navy">Verified Family Profile</h2>
                  <p className="text-xs text-muted">
                    Official primary contact and service records associated with {email}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="success">Active Profile</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={loadProfile}
                    disabled={isProfileLoading}
                    className="gap-1.5"
                  >
                    <RefreshCw className={`size-3.5 ${isProfileLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-line bg-page/50 p-4">
                  <User className="size-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Registered Email
                    </p>
                    <p className="mt-1 text-sm font-medium text-navy">{profile.email || profile.userEmail || email}</p>
                    <p className="mt-0.5 text-[11px] text-muted font-mono">User ID: #{profile.userId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-line bg-page/50 p-4">
                  <Phone className="size-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Contact Phone Number
                    </p>
                    <p className="mt-1 text-sm font-medium text-navy">{profile.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-line bg-page/50 p-4 sm:col-span-2">
                  <MapPin className="size-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Permanent Postal Address
                    </p>
                    <p className="mt-1 text-sm font-medium text-navy whitespace-pre-wrap">{profile.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-line bg-page/50 p-4 sm:col-span-2">
                  <Award className="size-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Service &amp; Unit Details
                    </p>
                    <p className="mt-1 text-sm font-medium text-navy whitespace-pre-wrap">
                      {profile.serviceDetails || 'No service details provided.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-line bg-page p-4 text-xs text-muted">
                <span className="font-semibold text-navy">Note:</span> Family profiles in Veer Parivaar V1 are
                registered once for identity consistency. If you need to update your official address or phone number,
                please submit a support request or contact your designated volunteer.
              </div>
            </Card>
          ) : profileNotFound ? (
            /* Complete Profile Form */
            <Card className="p-6">
              <div className="border-b border-line pb-4">
                <h2 className="text-lg font-bold text-navy">Complete Your Family Profile</h2>
                <p className="text-xs text-muted">
                  Please provide your contact information to enable defence administrators and field
                  volunteers to coordinate support for your family.
                </p>
              </div>

              {profileError ? (
                <div className="mt-4">
                  <Alert tone="error" title="Submission Error">
                    {profileError}
                  </Alert>
                </div>
              ) : null}

              <form onSubmit={handleCreateProfile} className="mt-6 flex flex-col gap-4">
                <TextField
                  id="profile-phone"
                  label="Contact Phone Number"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  disabled={isSavingProfile}
                  hint="Provide a reliable mobile number for volunteer communication."
                />

                <div>
                  <label htmlFor="profile-address" className="text-sm font-semibold text-navy-secondary">
                    Permanent Residential Address *
                  </label>
                  <textarea
                    id="profile-address"
                    rows={3}
                    required
                    placeholder="House/Plot No., Street, Village/Town, District, State, PIN code..."
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    disabled={isSavingProfile}
                    className="mt-1.5 w-full rounded-lg border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                  />
                </div>

                <div>
                  <label htmlFor="profile-service-details" className="text-sm font-semibold text-navy-secondary">
                    Soldier Service &amp; Regimental Details
                  </label>
                  <textarea
                    id="profile-service-details"
                    rows={3}
                    placeholder="e.g. Service ID / Army Number, Rank, Regiment / Unit, Operation / Deployment details..."
                    value={profileForm.serviceDetails}
                    onChange={(e) => setProfileForm({ ...profileForm, serviceDetails: e.target.value })}
                    disabled={isSavingProfile}
                    className="mt-1.5 w-full rounded-lg border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
                  />
                  <p className="mt-1 text-xs text-muted">
                    In V1 this information is recorded directly with your profile. Full Service ID verification against
                    army master records will be supported in V2.
                  </p>
                </div>

                <div className="flex justify-end border-t border-line pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSavingProfile}
                    className="gap-1.5"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      'Save Family Profile'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Alert tone="error" title="Profile Error">
              {profileError || 'Unable to display profile information.'}
            </Alert>
          )}
        </div>
      ) : null}
    </div>
  )
}
