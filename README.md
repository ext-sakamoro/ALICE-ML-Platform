# ALICE-ML-Platform

Cloud ML serving platform built on Project A.L.I.C.E. — 1.58-bit ternary
inference with addition-only matrix operations (no multiplications), multi-precision
quantization (fp32 → 1.58-bit / 4-bit / 8-bit), model deployment, and energy
benchmarking through a single REST API.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│          Landing Page  │  Dashboard Console         │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│               ML API (Rust / Axum)                   │
│   /infer  /quantize  /deploy  /benchmark  /stats    │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│            ALICE-ML Engine (Rust)                    │
│  Ternary Inference {-1,0,+1}  │  Quantization Engine │
│  SIMD AVX2/NEON               │  Rayon Parallelism   │
│  Model Registry               │  Energy Profiler     │
└─────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| 1.58-Bit Ternary Inference | Weights in {-1, 0, +1} — addition-only, no multiplications |
| fp32 → 1.58-bit Quantization | Calibration-data-driven quantization with accuracy metrics |
| 4-bit / 8-bit Quantization | Standard INT4/INT8 paths for broad hardware compatibility |
| Model Deployment | Deploy quantized models to serving endpoints with replica control |
| Energy Benchmarking | tokens/s, joules/token, peak memory per model and precision |
| Model Registry | List, version and manage deployed model checkpoints |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/ml/infer` | Run inference with a deployed model |
| POST | `/api/v1/ml/quantize` | Quantize a model to target precision |
| POST | `/api/v1/ml/deploy` | Deploy a quantized model to a serving endpoint |
| POST | `/api/v1/ml/benchmark` | Benchmark throughput and energy efficiency |
| GET | `/api/v1/ml/models` | List all registered models and their status |
| GET | `/api/v1/ml/stats` | Service throughput and energy metrics |

## Quick Start

```bash
# Clone and start the backend
git clone https://github.com/ext-sakamoro/ALICE-ML-Platform
cd ALICE-ML-Platform
cargo build --release
./target/release/alice-ml-server

# In a separate terminal, start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Inference example

```bash
curl -X POST http://localhost:8081/api/v1/ml/infer \
  -H "Content-Type: application/json" \
  -d '{"model_id":"alice-ternary-v1","inputs":[[0.1,-0.5,0.9,0.3]],"precision":"1.58bit"}'
```

### Quantize example

```bash
curl -X POST http://localhost:8081/api/v1/ml/quantize \
  -H "Content-Type: application/json" \
  -d '{"model_id":"gpt2-small","source_precision":"fp32","target_precision":"1.58bit","calibration_samples":512}'
```

## License

AGPL-3.0-or-later — see [LICENSE](./LICENSE)
