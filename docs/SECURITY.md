# Security Checklist

## General Security Practices
- Regularly update dependencies to address vulnerabilities.
- Enforce least privilege principle for user permissions.
- Monitor and log access to sensitive data.

## Environment Variables Best Practices
- Avoid hardcoding sensitive information in your codebase.
- Use environment variables to manage secrets and configuration.
- Document required environment variables in your project README or separate documentation.

## Secret Management
- Use a dedicated secrets management tool (e.g., AWS Secrets Manager, HashiCorp Vault) for storing sensitive information.
- Rotate secrets regularly to minimize exposure risk.
- Audit access to secrets to ensure compliance with security policies.