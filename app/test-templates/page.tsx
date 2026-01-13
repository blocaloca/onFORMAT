'use client'

import { getAllTemplates, ProjectTemplate, TemplateStage } from '@/lib/project-templates'

export default function TestTemplatesPage() {
  const templates = getAllTemplates()

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1D1D1F] mb-2">Project Templates</h1>
          <p className="text-gray-600">4 production templates with custom workflows</p>
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-[#E5E5EA] rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{template.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#1D1D1F] mb-1">{template.name}</h2>
                  <p className="text-gray-600 mb-2">{template.description}</p>
                  <p className="text-sm text-purple-600 font-medium">
                    Principal: {template.principalCreator}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {template.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex-1 text-center py-2 px-3 rounded-lg text-sm font-semibold"
                    style={{
                      backgroundColor: `${stage.color}1A`, // 10% opacity
                      color: stage.color
                    }}
                  >
                    <div>{stage.emoji}</div>
                    <div className="text-xs mt-1">{stage.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Template Breakdown */}
        {templates.map((template) => (
          <div key={`detail-${template.id}`} className="mb-12">
            <div className="bg-white border border-[#E5E5EA] rounded-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">{template.icon}</div>
                <div>
                  <h2 className="text-3xl font-bold text-[#1D1D1F]">{template.name}</h2>
                  <p className="text-gray-600">{template.principalCreator}</p>
                </div>
              </div>

              {/* Stages and Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {template.stages.map((stage) => (
                  <div key={stage.id}>
                    <div
                      className="mb-4 p-3 rounded-lg"
                      style={{
                        backgroundColor: `${stage.color}1A`,
                        borderLeft: `4px solid ${stage.color}`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{stage.emoji}</span>
                        <h3
                          className="text-lg font-bold"
                          style={{ color: stage.color }}
                        >
                          {stage.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {stage.documents.length} documents
                      </p>
                    </div>

                    <div className="space-y-2">
                      {stage.documents.map((doc) => (
                        <div
                          key={doc.type}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition"
                        >
                          <span className="text-lg">{doc.icon}</span>
                          <span className="text-sm text-[#1D1D1F] font-medium">
                            {doc.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Summary Statistics */}
        <div className="bg-white border border-[#E5E5EA] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-4">Template Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {templates.map((template) => {
              const totalDocs = template.stages.reduce(
                (sum, stage) => sum + stage.documents.length,
                0
              )
              return (
                <div key={`stat-${template.id}`} className="text-center">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <div className="text-2xl font-bold text-purple-600">{totalDocs}</div>
                  <div className="text-sm text-gray-600">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {template.stages.length} stages
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
