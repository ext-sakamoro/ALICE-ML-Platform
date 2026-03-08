-- ALICE ML Platform: Domain-specific tables
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    params TEXT NOT NULL,
    precision TEXT NOT NULL DEFAULT '1.58bit' CHECK (precision IN ('1.58bit', '4bit', '8bit', 'fp16', 'fp32')),
    size_mb DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('uploading', 'quantizing', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ml_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    precision TEXT NOT NULL DEFAULT '1.58bit',
    replicas INTEGER NOT NULL DEFAULT 2,
    region TEXT NOT NULL DEFAULT 'us-east-1',
    endpoint TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'deploying' CHECK (status IN ('deploying', 'running', 'stopped', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ml_inference_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES ml_deployments(id) ON DELETE CASCADE,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    latency_us BIGINT NOT NULL DEFAULT 0,
    energy_saved_pct DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ml_models_user ON ml_models(user_id);
CREATE INDEX idx_ml_deployments_model ON ml_deployments(model_id);
CREATE INDEX idx_ml_inference_logs_deployment ON ml_inference_logs(deployment_id, created_at);
