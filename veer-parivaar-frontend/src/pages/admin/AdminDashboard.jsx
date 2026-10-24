import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  X,
  Eye,
  Info,
} from 'lucide-react'
import { Alert } from '../../components/common/Alert'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { TextField } from '../../components/common/TextField'
import { adminService } from '../../services/api'

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

export function AdminDashboard() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Assign Modal
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [volunteerIdInput, setVolunteerIdInput] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  // Details Modal
  const [viewingRequest, setViewingRequest] = useState(null)

  async function fetchRequests() {
    setIsLoading(true)
    setError('')
    try {
      const data = await adminService.getAllRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load support requests from server.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    adminService.getAllRequests()
      .then((data) => {
        if (active) setRequests(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load support requests from server.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Derived status counts strictly from real API data
  const counts = useMemo(() => {
    const summary = {
      total: requests.length,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    }
    for (const req of requests) {
      const st = (req.status || '').toUpperCase()
      if (st === 'PENDING') summary.pending += 1
      else if (st === 'ASSIGNED') summary.assigned += 1
      else if (st === 'IN_PROGRESS') summary.inProgress += 1
      else if (st === 'RESOLVED') summary.resolved += 1
      else if (st === 'REJECTED') summary.rejected += 1
    }
    return summary
  }, [requests])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'ALL' && (req.status || '').toUpperCase() !== statusFilter) {
        return false
      }
      if (priorityFilter !== 'ALL' && (req.priority || '').toUpperCase() !== priorityFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const desc = (req.description || '').toLowerCase()
        const email = (req.email || req.userEmail || '').toLowerCase()
        const cat = (req.category || '').toLowerCase()
        const id = String(req.id || '')
        const volEmail = (req.volunteerEmail || '').toLowerCase()
        if (
          !desc.includes(query) &&
          !email.includes(query) &&
          !cat.includes(query) &&
          !id.includes(query) &&
          !volEmail.includes(query)
        ) {
          return false
        }
      }
      return true
    })
  }, [requests, statusFilter, priorityFilter, searchQuery])

  function handleOpenAssign(req) {
    setSelectedRequest(req)
    setVolunteerIdInput(req.volunteerId ? String(req.volunteerId) : '')
    setAssignError('')
  }

  function handleCloseAssign() {
    setSelectedRequest(null)
    setVolunteerIdInput('')
    setAssignError('')
  }

  async function handleAssignSubmit(e) {
    e.preventDefault()
    if (!volunteerIdInput.trim()) {
      setAssignError('Please enter a valid numeric Volunteer ID.')
      return
    }

    const volIdNum = Number(volunteerIdInput.trim())
    if (isNaN(volIdNum) || volIdNum <= 0) {
      setAssignError('Volunteer ID must be a positive integer.')
      return
    }

    setIsAssigning(true)
    setAssignError('')

    try {
      await adminService.assignRequest(selectedRequest.id, volIdNum)
      setActionSuccess(`Request #${selectedRequest.id} successfully assigned to Volunteer ID ${volIdNum}.`)
      handleCloseAssign()
      await fetchRequests()
    } catch (err) {
      setAssignError(err.message || 'Failed to assign request.')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* V1 Boundary Callout */}
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-xs text-muted shadow-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-navy" />
        <div>
          <span className="font-semibold text-navy">Veer Parivaar V1 Administration Scope:</span>{' '}
          Live support request triage and volunteer assignment are active. Soldier Service ID verification,
          directory lookup, and relationship approval workflows are scheduled for V2.
        </div>
      </div>

      {actionSuccess ? (
        <Alert tone="success" title="Action Completed">
          <div className="flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              type="button"
              onClick={() => setActionSuccess('')}
              className="ml-4 text-xs underline font-medium"
            >
              Dismiss
            </button>
          </div>
        </Alert>
      ) : null}

      {/* Real-time Status Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total</p>
          <p className="mt-1 text-2xl font-bold text-navy">{counts.total}</p>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{counts.pending}</p>
        </Card>
        <Card className="p-4 border-blue-200 bg-blue-50/40">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Assigned</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{counts.assigned}</p>
        </Card>
        <Card className="p-4 border-sky-200 bg-sky-50/40">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-sky-800">{counts.inProgress}</p>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50/40">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-green-800">{counts.resolved}</p>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50/40">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-800">{counts.rejected}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by ID, category, email, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted" />
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-navy focus:border-accent"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by Priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-10 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-navy focus:border-accent"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Refresh Action */}
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchRequests}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Table / Requests List */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-line bg-surface/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy">Support Requests</h2>
              <p className="text-xs text-muted">
                Showing {filteredRequests.length} of {requests.length} requests
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <Alert tone="error" title="Failed to retrieve requests">
              <div className="flex flex-col gap-2">
                <span>{error}</span>
                <Button variant="secondary" size="sm" onClick={fetchRequests} className="w-fit">
                  Retry Loading
                </Button>
              </div>
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <RefreshCw className="size-8 animate-spin text-navy/40" />
            <p className="mt-3 text-sm font-medium">Fetching support requests from database...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
            <Clock className="size-10 text-muted/40" />
            <p className="mt-3 text-sm font-semibold text-navy">No support requests found</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters or search terms.'
                : 'No support requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Requester</th>
                  <th className="px-6 py-3.5">Assigned Volunteer</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-page/50 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-navy">
                      #{req.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-ink">
                      {req.category}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={priorityTones[req.priority] || 'navy'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={statusTones[req.status] || 'navy'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-ink">
                      <div className="font-medium">{req.email || req.userEmail}</div>
                      <div className="text-[11px] text-muted font-mono">User ID: {req.userId}</div>
                    </td>
                    <td className="px-6 py-4">
                      {req.volunteerEmail ? (
                        <div className="flex items-center gap-1.5 text-navy font-medium">
                          <UserCheck className="size-3.5 text-success" />
                          <span>{req.volunteerEmail}</span>
                          <span className="text-[11px] text-muted font-mono">(ID: {req.volunteerId})</span>
                        </div>
                      ) : (
                        <span className="text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted text-xs">
                      {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewingRequest(req)}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <Eye className="size-3.5" />
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenAssign(req)}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <UserPlus className="size-3.5" />
                          {req.volunteerId ? 'Reassign' : 'Assign'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details View Modal */}
      {viewingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy">
                  Support Request #{viewingRequest.id}
                </h3>
                <p className="text-xs text-muted">Details &amp; Requester Context</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-navy"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted">Category</p>
                  <p className="mt-0.5 font-medium text-ink">{viewingRequest.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Priority</p>
                  <Badge tone={priorityTones[viewingRequest.priority] || 'navy'} className="mt-0.5">
                    {viewingRequest.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Status</p>
                  <Badge tone={statusTones[viewingRequest.status] || 'navy'} className="mt-0.5">
                    {viewingRequest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Created At</p>
                  <p className="mt-0.5 text-xs text-ink">
                    {viewingRequest.createdAt ? new Date(viewingRequest.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-line bg-page p-3.5">
                <p className="text-xs font-semibold text-navy">Requester Information</p>
                <p className="mt-1 text-sm font-medium text-ink">{viewingRequest.email || viewingRequest.userEmail}</p>
                <p className="text-xs text-muted font-mono">User ID: #{viewingRequest.userId}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted">Request Description</p>
                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-line bg-page/50 p-3 text-ink text-sm whitespace-pre-wrap">
                  {viewingRequest.description || 'No detailed description provided.'}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-page p-3.5">
                <p className="text-xs font-semibold text-navy">Assigned Volunteer</p>
                {viewingRequest.volunteerEmail ? (
                  <p className="mt-1 text-sm font-medium text-ink">
                    {viewingRequest.volunteerEmail}{' '}
                    <span className="font-mono text-xs text-muted">(ID: {viewingRequest.volunteerId})</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted italic">Currently unassigned</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-line pt-3">
              <Button variant="secondary" size="sm" onClick={() => setViewingRequest(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const req = viewingRequest
                  setViewingRequest(null)
                  handleOpenAssign(req)
                }}
              >
                {viewingRequest.volunteerId ? 'Reassign Volunteer' : 'Assign Volunteer'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Assign Volunteer Modal */}
      {selectedRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy">Assign Request #{selectedRequest.id}</h3>
                <p className="text-xs text-muted">Direct Volunteer Allocation</p>
              </div>
              <button
                type="button"
                onClick={handleCloseAssign}
                className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-navy"
                disabled={isAssigning}
              >
                <X className="size-5" />
              </button>
            </div>

            {assignError ? (
              <div className="mt-4">
                <Alert tone="error" title="Assignment Error">
                  {assignError}
                </Alert>
              </div>
            ) : null}

            <form onSubmit={handleAssignSubmit} className="mt-4 flex flex-col gap-4">
              <div className="rounded-lg border border-line bg-page p-3 text-xs text-muted">
                <p className="font-semibold text-navy">Request Context:</p>
                <p className="mt-1">
                  Category: <span className="font-medium text-ink">{selectedRequest.category}</span>
                </p>
                <p>
                  Requester: <span className="font-medium text-ink">{selectedRequest.email || selectedRequest.userEmail}</span>
                </p>
                {selectedRequest.volunteerEmail ? (
                  <p className="text-amber-800">
                    Currently assigned to: {selectedRequest.volunteerEmail} (ID: {selectedRequest.volunteerId})
                  </p>
                ) : null}
              </div>

              <TextField
                id="assign-volunteer-id"
                label="Volunteer User ID"
                type="number"
                min="1"
                required
                value={volunteerIdInput}
                onChange={(e) => setVolunteerIdInput(e.target.value)}
                placeholder="e.g. 2"
                hint="Enter the numeric ID of an authorized VOLUNTEER account."
                disabled={isAssigning}
              />

              <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCloseAssign}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAssigning}
                  className="gap-1.5"
                >
                  {isAssigning ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      Confirm Assignment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
