import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Filter,
  Play,
  RefreshCw,
  Search,
  XCircle,
  Eye,
  Info,
  X,
} from 'lucide-react'
import { Alert } from '../../components/common/Alert'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { volunteerService } from '../../services/api'

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

export function VolunteerDashboard() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Status Update state
  const [updatingId, setUpdatingId] = useState(null)
  const [updateError, setUpdateError] = useState('')

  // View Details Modal
  const [viewingRequest, setViewingRequest] = useState(null)

  async function fetchAssignedRequests() {
    setIsLoading(true)
    setError('')
    try {
      const data = await volunteerService.getAssignedRequests()
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned support requests.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    volunteerService.getAssignedRequests()
      .then((data) => {
        if (active) setRequests(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to fetch assigned support requests.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Derived metrics from real API data
  const metrics = useMemo(() => {
    const counts = {
      total: requests.length,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    }
    for (const req of requests) {
      const st = (req.status || '').toUpperCase()
      if (st === 'ASSIGNED') counts.assigned += 1
      else if (st === 'IN_PROGRESS') counts.inProgress += 1
      else if (st === 'RESOLVED') counts.resolved += 1
      else if (st === 'REJECTED') counts.rejected += 1
    }
    return counts
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
        if (!desc.includes(query) && !email.includes(query) && !cat.includes(query) && !id.includes(query)) {
          return false
        }
      }
      return true
    })
  }, [requests, statusFilter, priorityFilter, searchQuery])

  async function handleStatusChange(requestId, newStatus) {
    setUpdatingId(requestId)
    setUpdateError('')
    setActionSuccess('')

    try {
      await volunteerService.updateStatus(requestId, newStatus)
      setActionSuccess(`Request #${requestId} status updated to ${newStatus}.`)
      await fetchAssignedRequests()
      if (viewingRequest && viewingRequest.id === requestId) {
        setViewingRequest((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      setUpdateError(err.message || `Failed to update status to ${newStatus}.`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* V1 Boundary Callout */}
      <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-xs text-muted shadow-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-navy" />
        <div>
          <span className="font-semibold text-navy">Volunteer Operations Scope:</span> Only requests
          officially assigned to your volunteer account by defence administrators are displayed.
          Status transitions adhere strictly to verified backend rules.
        </div>
      </div>

      {actionSuccess ? (
        <Alert tone="success" title="Status Updated">
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

      {updateError ? (
        <Alert tone="error" title="Status Update Failed">
          <div className="flex items-center justify-between">
            <span>{updateError}</span>
            <button
              type="button"
              onClick={() => setUpdateError('')}
              className="ml-4 text-xs underline font-medium"
            >
              Dismiss
            </button>
          </div>
        </Alert>
      ) : null}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Assigned</p>
          <p className="mt-1 text-2xl font-bold text-navy">{metrics.total}</p>
        </Card>
        <Card className="p-4 border-blue-200 bg-blue-50/40">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Awaiting Start</p>
          <p className="mt-1 text-2xl font-bold text-blue-800">{metrics.assigned}</p>
        </Card>
        <Card className="p-4 border-sky-200 bg-sky-50/40">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-sky-800">{metrics.inProgress}</p>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50/40">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-green-800">{metrics.resolved}</p>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search by ID, category, or requester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted" />
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-navy focus:border-accent"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

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

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchAssignedRequests}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Requests List */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-line bg-surface/50 px-6 py-4">
          <h2 className="text-base font-bold text-navy">Assigned Support Cases</h2>
          <p className="text-xs text-muted">
            Displaying {filteredRequests.length} active assignment{filteredRequests.length === 1 ? '' : 's'}
          </p>
        </div>

        {error ? (
          <div className="p-6">
            <Alert tone="error" title="Error Loading Assignments">
              <div className="flex flex-col gap-2">
                <span>{error}</span>
                <Button variant="secondary" size="sm" onClick={fetchAssignedRequests} className="w-fit">
                  Retry Loading
                </Button>
              </div>
            </Alert>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <RefreshCw className="size-8 animate-spin text-navy/40" />
            <p className="mt-3 text-sm font-medium">Loading assigned requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
            <Clock className="size-10 text-muted/40" />
            <p className="mt-3 text-sm font-semibold text-navy">No Assigned Requests</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'No matching requests for the current filter criteria.'
                : 'You have no support requests currently assigned to your queue.'}
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
                  <th className="px-6 py-3.5">Family Contact</th>
                  <th className="px-6 py-3.5">Assigned Date</th>
                  <th className="px-6 py-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {filteredRequests.map((req) => {
                  const currentStatus = (req.status || '').toUpperCase()
                  const isUpdatingThis = updatingId === req.id

                  return (
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
                        <span className="font-medium">{req.email || req.userEmail}</span>
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
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
                            Details
                          </Button>

                          {/* Valid Backend Status Transitions */}
                          {currentStatus === 'ASSIGNED' ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isUpdatingThis}
                                onClick={() => handleStatusChange(req.id, 'IN_PROGRESS')}
                                className="h-8 px-2.5 text-xs gap-1 bg-sky-700 hover:bg-sky-800"
                              >
                                {isUpdatingThis ? (
                                  <RefreshCw className="size-3.5 animate-spin" />
                                ) : (
                                  <Play className="size-3.5" />
                                )}
                                Start
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isUpdatingThis}
                                onClick={() => handleStatusChange(req.id, 'REJECTED')}
                                className="h-8 px-2.5 text-xs gap-1 text-danger border-danger/30 hover:bg-red-50"
                              >
                                <XCircle className="size-3.5" />
                                Reject
                              </Button>
                            </>
                          ) : null}

                          {currentStatus === 'IN_PROGRESS' ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isUpdatingThis}
                                onClick={() => handleStatusChange(req.id, 'RESOLVED')}
                                className="h-8 px-2.5 text-xs gap-1 bg-green-700 hover:bg-green-800"
                              >
                                {isUpdatingThis ? (
                                  <RefreshCw className="size-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="size-3.5" />
                                )}
                                Resolve
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={isUpdatingThis}
                                onClick={() => handleStatusChange(req.id, 'REJECTED')}
                                className="h-8 px-2.5 text-xs gap-1 text-danger border-danger/30 hover:bg-red-50"
                              >
                                <XCircle className="size-3.5" />
                                Reject
                              </Button>
                            </>
                          ) : null}

                          {currentStatus === 'RESOLVED' || currentStatus === 'REJECTED' ? (
                            <span className="text-xs text-muted italic">Case Completed</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {viewingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy">
                  Case Details #{viewingRequest.id}
                </h3>
                <p className="text-xs text-muted">Field Volunteer Request View</p>
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
                  <p className="text-xs font-semibold text-muted">Current Status</p>
                  <Badge tone={statusTones[viewingRequest.status] || 'navy'} className="mt-0.5">
                    {viewingRequest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">Created Timestamp</p>
                  <p className="mt-0.5 text-xs text-ink">
                    {viewingRequest.createdAt ? new Date(viewingRequest.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-line bg-page p-3.5">
                <p className="text-xs font-semibold text-navy">Family Contact Details</p>
                <p className="mt-1 text-sm font-medium text-ink">{viewingRequest.email || viewingRequest.userEmail}</p>
                <p className="text-xs text-muted font-mono">User Reference: #{viewingRequest.userId}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted">Request Description</p>
                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-line bg-page/50 p-3 text-ink text-sm whitespace-pre-wrap">
                  {viewingRequest.description || 'No detailed description provided.'}
                </div>
              </div>

              {/* Quick actions inside modal */}
              {viewingRequest.status === 'ASSIGNED' ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-blue-900">
                  <p className="font-semibold">Ready to begin this task?</p>
                  <p className="mt-0.5 text-blue-700">
                    Switch status to IN_PROGRESS when you have begun contacting the family.
                  </p>
                </div>
              ) : viewingRequest.status === 'IN_PROGRESS' ? (
                <div className="rounded-lg border border-green-200 bg-green-50/50 p-3.5 text-xs text-green-900">
                  <p className="font-semibold">In Progress</p>
                  <p className="mt-0.5 text-green-700">
                    Once all support has been delivered, mark the case as RESOLVED.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-line pt-3">
              <Button variant="secondary" size="sm" onClick={() => setViewingRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
