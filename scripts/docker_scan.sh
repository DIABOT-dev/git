#!/bin/bash
# Docker Security Scanning Script using Trivy
# Scans Docker image for vulnerabilities and generates report

set -e

IMAGE_NAME="${1:-diabot/app:latest}"
SEVERITY="${2:-HIGH,CRITICAL}"
OUTPUT_FORMAT="${3:-table}"

echo "========================================"
echo "Docker Security Scan"
echo "========================================"
echo "Image: $IMAGE_NAME"
echo "Severity: $SEVERITY"
echo "Output: $OUTPUT_FORMAT"
echo ""

# Check if Trivy is installed
if ! command -v trivy &> /dev/null; then
    echo "ERROR: Trivy is not installed"
    echo ""
    echo "Install Trivy:"
    echo "  macOS:   brew install aquasecurity/trivy/trivy"
    echo "  Linux:   See https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
    echo "  Docker:  Use trivy/trivy image"
    echo ""
    exit 1
fi

echo "Scanning image for vulnerabilities..."
echo ""

# Run Trivy scan
trivy image \
    --severity "$SEVERITY" \
    --format "$OUTPUT_FORMAT" \
    --exit-code 0 \
    "$IMAGE_NAME"

echo ""
echo "========================================"
echo "Scan complete"
echo "========================================"
echo ""
echo "To generate JSON report:"
echo "  $0 $IMAGE_NAME $SEVERITY json > security-report.json"
echo ""
echo "To scan with Trivy in Docker:"
echo "  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\"
echo "    aquasec/trivy:latest image --severity $SEVERITY $IMAGE_NAME"
