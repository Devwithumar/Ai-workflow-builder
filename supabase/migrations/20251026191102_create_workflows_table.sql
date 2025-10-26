/*
  # AI Workflow Builder Database Schema

  1. New Tables
    - `workflows`
      - `id` (uuid, primary key) - Unique workflow identifier
      - `user_id` (uuid) - Owner of the workflow
      - `name` (text) - Workflow name
      - `description` (text, nullable) - Optional workflow description
      - `nodes` (jsonb) - Workflow nodes data (positions, configs)
      - `edges` (jsonb) - Workflow connections data
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `workflows` table
    - Add policies for authenticated users to manage their own workflows
    - Users can only read, create, update, and delete their own workflows

  3. Notes
    - JSONB columns store react-flow node and edge data for flexibility
    - Timestamps track workflow creation and modification history
*/

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  nodes jsonb DEFAULT '[]'::jsonb,
  edges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);