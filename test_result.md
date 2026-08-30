#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================
## Test Run — Post UI-Redesign + 4 Feature Additions (2026-06)

backend:
  - task: "AI proxy endpoints (Emergent Universal Key)"
    file: "/app/backend/server.py"
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Re-verify /api/health, /api/ai/generate-protocol (provider gpt & gemini), /api/ai/ocr-label, /api/ai/ocr-bloodtest still respond after edits. generate-protocol body: {provider:'gpt'|'gemini', context:{...}}. OCR bodies need a real base64 image; see /app/image_testing.md."

frontend:
  - task: "Cabinet/Stash redesign (search + scan row, missing-item card, icon-tile cards)"
    file: "/app/frontend/app/(tabs)/stash.tsx"
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Fixed crash (undefined ChipRow). New: search input (testID stash-search) filters list; scan button (stash-scan) -> /scan; 'Recommended · Not in Cabinet' card (missing-item-card) with Buy (missing-item-buy); icon-tile stash cards with quality badge, stock bar, steppers (stock-plus/minus-<id>), delete (delete-<id>). FAB removed."
  - task: "Dashboard 4 features (streak, low-stock, guardrails, modes, bloodwork)"
    file: "/app/frontend/app/(tabs)/index.tsx, /app/frontend/src/components/dashboardCards.tsx"
    status_history:
      - working: "NA"
        agent: "main"
        comment: "ModeSelector (mode-auto/travel/illness/deload) changes protocol via reanalyze. StreakCard, GuardrailCard, LowStockCard (reorder-<id>), BloodworkCard render conditionally. Chrono timeline via ChronoTimeline. Sync & Re-Analyze (sync-reanalyze) + header-sync."
  - task: "Settings / Trends / Scan / Breath still work after redesign"
    file: "/app/frontend/app/(tabs)/settings.tsx, trends.tsx, /app/frontend/app/scan.tsx, breath.tsx"
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Settings: theme segmented, region chips (re-analyze), 5 AI providers, secure key save, telemetry presets (preset-run-<id> -> re-analyze), health toggles. Trends: metric segmented + chart. Scan: supplement manual add + blood-test panel segmented. Breath pacer reachable from StressBanner when acute_stress preset active."

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 2

test_plan:
  current_focus:
    - "Cabinet/Stash redesign"
    - "Dashboard 4 features"
    - "Settings / Trends / Scan / Breath regression"
    - "Backend AI proxy endpoints"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Completed clinical-light Material-3 UI redesign (Dashboard + Cabinet) and fixed a Cabinet crash. All 4 previously-added features (adherence streak, low-stock reorder, interaction guardrails, Travel/Illness/Deload modes, blood-test import) are wired but were never tested. App has NO auth. Default AI provider is offline Mock (client-side). To exercise Emergent backend paths, switch provider in Settings or curl endpoints directly. Please test both backend endpoints and all frontend flows."
