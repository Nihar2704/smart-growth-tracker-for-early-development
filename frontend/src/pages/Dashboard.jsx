import React from 'react';
import { Users, TrendingUp, CheckCircle2, Plus, ArrowRight, ShieldCheck, Brain } from 'lucide-react';
import ChildCard from '../components/ChildCard';

export default function Dashboard({ children, onSelectChild, onOpenAddChild, onNavigateChildren }) {
  const totalChildren = children.length;

  return (
    <div className="space-y-7">
      {/* Page Title & Context Header */}
      <div className="panel-card p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider panel-card-subtle text-[var(--primary)]">
                Child Development & Growth Tracker
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Early Childhood Growth & Milestone Overview
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-3xl leading-relaxed">
              Record physical growth parameters (height, weight, BMI), track growth trajectories against WHO references, and evaluate age-appropriate CDC developmental milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddChild}
              className="flex items-center gap-2.5 btn-primary text-sm px-5 py-3 cursor-pointer shadow-xs"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Child Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Metrics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="panel-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] font-medium">
            <span>Registered Children</span>
            <Users className="w-5 h-5 text-[var(--text-secondary)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--text-main)]">{totalChildren}</p>
          <p className="text-xs text-[var(--text-secondary)]">Active child profiles</p>
        </div>

        <div className="panel-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] font-medium">
            <span>Physical Growth</span>
            <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <p className="text-base font-semibold text-[var(--text-main)] mt-1">Height, Weight, BMI</p>
          <p className="text-xs text-[var(--text-secondary)]">WHO growth references</p>
        </div>

        <div className="panel-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] font-medium">
            <span>CDC Milestones</span>
            <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <p className="text-base font-semibold text-[var(--text-main)] mt-1">5 Core Domains</p>
          <p className="text-xs text-[var(--text-secondary)]">Gross/fine motor, speech, cognitive</p>
        </div>

        <div className="panel-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] font-medium">
            <span>ML Engine</span>
            <Brain className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <p className="text-base font-semibold text-[var(--text-main)] mt-1">Gradient Boosting</p>
          <p className="text-xs text-[var(--primary)] font-bold">99.8% Accuracy</p>
        </div>
      </div>

      {/* Children List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Child Profiles ({totalChildren})
          </h2>
          {totalChildren > 0 && (
            <button
              onClick={onNavigateChildren}
              className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Profiles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {totalChildren === 0 ? (
          <div className="panel-card p-10 text-center space-y-4">
            <Users className="w-10 h-10 text-[var(--text-secondary)] mx-auto" />
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-[var(--text-main)]">No Child Profiles Created</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Create a child profile to begin recording physical growth parameters and milestone assessments.
              </p>
            </div>
            <button
              onClick={onOpenAddChild}
              className="inline-flex items-center gap-2 btn-primary text-sm px-4 py-2.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Child Profile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onSelect={onSelectChild}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Persistent Disclaimer Footer */}
      <div className="p-4.5 panel-card-subtle flex items-start gap-3.5 text-xs text-[var(--text-secondary)]">
        <ShieldCheck className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-xs">
          <strong className="text-[var(--text-main)] font-semibold">Educational Notice:</strong> Smart Growth Tracker is designed for educational decision support and early childhood development monitoring. It does not provide medical diagnosis or substitute professional healthcare evaluation.
        </p>
      </div>
    </div>
  );
}
