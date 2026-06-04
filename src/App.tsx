import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Project {
  id: number;
  workspace_id: number;
  project_name: string;
  description: string;
  summary: string | null;
  status: string;
}

interface Workspace {
  id: number;
  workspace_name: string;
  description: string;
  summary: string | null;
  status: string | null;
  projects?: Project[];
}

const API_BASE = "http://127.0.0.1:8000"

export default function App() {
  const queryClient = useQueryClient()
  const [currentView, setCurrentView] = useState<"login" | "register" | "dashboard">(
    localStorage.getItem("token") ? "dashboard" : "login"
  )
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))

  // ─── 1. DYNAMIC WORKSPACE ID STATE TRACKER ───
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<number | null>(
    localStorage.getItem("active_ws_id") ? Number(localStorage.getItem("active_ws_id")) : null
  )

  // Layout Controls
  const [showWSForm, setShowWSForm] = useState(false)
  const [activeWSFormId, setActiveWSFormId] = useState<number | null>(null)

  // Explicit Inputs Form Values
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [wsName, setWsName] = useState("")
  const [wsDesc, setWsDesc] = useState("")
  const [projName, setProjName] = useState("")
  const [projDesc, setProjDesc] = useState("")

  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  // ─── AUTHENTICATION NETWORK PIPELINES ───
  const registerMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_BASE}/register`, { username, password })
    },
    onSuccess: () => {
      alert("Account keys generated successfully! Proceeding to login gateway.")
      setCurrentView("login")
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Registration protocol rejected.")
  })

  const loginMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)
      const res = await axios.post(`${API_BASE}/login`, formData)
      return res.data
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token)
      setToken(data.access_token)
      setCurrentView("dashboard")
      setUsername("")
      setPassword("")
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Access verification failed.")
  })

  // ─── CORE DATABASE OPERATION STREAMS ───
  // 1. Fetch Workspace Standalone Data
  const { data: workspaceData } = useQuery<Workspace | null>({
    queryKey: ["workspace", activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return null
      const res = await axios.get(`${API_BASE}/workspaces/${activeWorkspaceId}`, authHeader)
      return res.data
    },
    enabled: !!token && currentView === "dashboard" && activeWorkspaceId !== null,
  })

  // 2. Fetch Projects Standalone Array
  const { data: projectsData } = useQuery<Project[]>({
    queryKey: ["workspace-projects", activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return []
      const res = await axios.get(`${API_BASE}/workspaces/${activeWorkspaceId}/projects`, authHeader)
      return res.data
    },
    enabled: !!token && currentView === "dashboard" && activeWorkspaceId !== null,
  })

  const createWSMutation = useMutation({
    mutationFn: async () => {
      return axios.post(`${API_BASE}/workspaces`, { workspace_name: wsName, description: wsDesc }, authHeader)
    },
    onSuccess: (response) => {
      const generatedId = response.data.id
      
      setActiveWorkspaceId(generatedId)
      localStorage.setItem("active_ws_id", String(generatedId))
      
      setWsName("")
      setWsDesc("")
      setShowWSForm(false)
      
      alert(`Success: Workspace Cluster #${generatedId} deployed and active!`)
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Failed to commit workspace cluster.")
  })

  // ─── SAFEGUARDED PROJECT MUTATION WITH STANDALONE KEY REVALIDATION ───
  const createProjMutation = useMutation({
    mutationFn: async (wsId: number) => {
      console.log(`Mapping Subproject explicitly to workspace ID Target: ${wsId}`)
      return axios.post(`${API_BASE}/workspaces/${wsId}/projects`, { project_name: projName, description: projDesc }, authHeader)
    },
    onSuccess: (_data, wsId) => {
      // Synchronize both key caches instantly using the mutation variables context
      queryClient.invalidateQueries({ queryKey: ["workspace", wsId] })
      queryClient.invalidateQueries({ queryKey: ["workspace-projects", wsId] })
      
      setProjName("")
      setProjDesc("")
      setActiveWSFormId(null)
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Could not allocate project subnode.")
  })

  const deleteWSMutation = useMutation({
    mutationFn: async (wsId: number) => {
      return axios.delete(`${API_BASE}/workspaces/${wsId}`, authHeader)
    },
    onSuccess: (_data, wsId) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", wsId] })
      queryClient.invalidateQueries({ queryKey: ["workspace-projects", wsId] })
      setActiveWorkspaceId(null)
      localStorage.removeItem("active_ws_id")
      alert("Workspace context dropped from relational registries.")
    },
    onError: (err: any) => alert(err.response?.data?.detail || "Drop workspace command rejected.")
  })

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("active_ws_id")
    setToken(null)
    setActiveWorkspaceId(null)
    setCurrentView("login")
  }

  if (currentView === "login" || currentView === "register") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-500 tracking-tight">
              {currentView === "login" ? "Security Core Gateway" : "Initialize Access Profiles"}
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              {currentView === "login" ? "Sign in to provision deployment layers" : "Register a new structural environment key link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Username Alias</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" placeholder="e.g., admin" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Passphrase Secret</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" placeholder="••••••••" />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                    onClick={() => currentView === "login" ? loginMutation.mutate() : registerMutation.mutate()}>
              {currentView === "login" ? "Authenticate Profile" : "Commit Record Profile"}
            </Button>
            <p className="text-xs text-center text-slate-400 mt-2 cursor-pointer hover:text-blue-400 transition-colors"
               onClick={() => setCurrentView(currentView === "login" ? "register" : "login")}>
              {currentView === "login" ? "Need an authorized link? Register keys here" : "Already registered? Return to gateway path"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">System Registry Console</h1>
          <p className="text-slate-400 text-sm mt-1">Live Relational Object Infrastructure Pool</p>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="font-semibold shadow-md">Secure Logout</Button>
      </header>

      <main className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-200 tracking-wide">Environment Workspaces</h2>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-8 w-8 p-0 text-xl font-bold shadow-md" onClick={() => setShowWSForm(!showWSForm)}>
            {showWSForm ? "×" : "+"}
          </Button>
        </div>

        {showWSForm && (
          <Card className="bg-slate-900 border-slate-800 text-slate-100 max-w-md p-4 shadow-lg animate-in fade-in duration-200">
            <CardHeader className="p-0 pb-3"><CardTitle className="text-base font-semibold text-emerald-400">Initialize Environment Registry</CardTitle></CardHeader>
            <CardContent className="p-0 space-y-3">
              <Input placeholder="Workspace Designation Code" value={wsName} onChange={e => setWsName(e.target.value)} className="bg-slate-950 border-slate-800" />
              <Input placeholder="Operational Parameters Scope Description" value={wsDesc} onChange={e => setWsDesc(e.target.value)} className="bg-slate-950 border-slate-800" />
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" onClick={() => createWSMutation.mutate()}>Commit Cluster Workspace</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          {workspaceData && workspaceData.id ? (
            <Card key={workspaceData.id} className="bg-slate-900 border-slate-800 text-slate-100 shadow-md">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">CLUSTER ID: #{workspaceData.id}</span>
                  <CardTitle className="text-2xl font-bold text-slate-100 mt-0.5">{workspaceData.workspace_name}</CardTitle>
                  <CardDescription className="text-slate-400 mt-1 text-sm">{workspaceData.description}</CardDescription>
                </div>
                <Button size="sm" variant="destructive" className="rounded-full h-8 w-8 p-0 text-xl font-bold shadow-md" onClick={() => deleteWSMutation.mutate(workspaceData.id)}>
                  -
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Linked Project Subnodes</h3>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-5 w-5 p-0 text-sm rounded-full flex items-center justify-center font-bold" onClick={() => setActiveWSFormId(activeWSFormId === workspaceData.id ? null : workspaceData.id)}>
                    {activeWSFormId === workspaceData.id ? "×" : "+"}
                  </Button>
                </div>

                {activeWSFormId === workspaceData.id && (
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-3 max-w-sm shadow-inner animate-in slide-in-from-top-2 duration-150">
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Deploy Project Subnode</p>
                    <Input placeholder="Project Module Identifier" value={projName} onChange={e => setProjName(e.target.value)} className="bg-slate-900 border-slate-800 h-8 text-xs" />
                    <Input placeholder="Functional Objective Scope" value={projDesc} onChange={e => setProjDesc(e.target.value)} className="bg-slate-900 border-slate-800 h-8 text-xs" />
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-medium" onClick={() => createProjMutation.mutate(workspaceData.id)}>Map Subproject</Button>
                  </div>
                )}

                {/* ─── RENDER SUBMODULE PROJECT LAYOUT FROM INDEPENDENT DATA FILTER ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {projectsData && projectsData.length > 0 ? (
                    projectsData.map((proj) => (
                      <div key={proj.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-100 text-base tracking-tight capitalize">{proj.project_name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-900/50 uppercase font-mono tracking-wider">
                            ID: #{proj.id}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 uppercase font-mono tracking-wider">
                            Status: {proj.status || "pending"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2">No active project modules linked to this environment cluster pool node.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <p className="text-sm text-slate-400 italic">No active workspace instance is currently selected or deployed in this session layout.</p>
              <p className="text-xs text-slate-600 mt-1">Click the top master green (+) toggle button above to issue an entry allocation command.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}