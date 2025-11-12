# 🚀 Hello mTLS App on AWS EKS

## 🧩 Overview  
This project demonstrates deploying a **Hello World** Node.js application on **Amazon EKS (Elastic Kubernetes Service)** using **Terraform**.  
The application enforces **mutual TLS (mTLS)** authentication using **self-signed certificates** for secure client-server communication.

---

## ⚙️ Infrastructure as Code (IaC)
The infrastructure was fully provisioned using **Terraform**, including:
- An **EKS Cluster** with managed node group  
- An **ECR Repository** to store container images  
- Required IAM roles, OIDC provider, and policies for worker nodes  

📁 Terraform configuration is located under:
```
infra/terraform/
```

---

## 🔐 Certificates
All certificates are **self-signed** and generated using **OpenSSL** (for cost efficiency).  
They are stored in the following directory:
```
app/certs/
```

### Certificate Files:
| File | Description |
|------|--------------|
| `ca.crt` / `ca.key` | Certificate Authority (CA) files |
| `tls.crt` / `tls.key` | Server certificate and key |
| `client.crt` / `client.key` | Client certificate and key |

### Generate Certificates
```bash
# Create CA
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -subj "/CN=mtls-ca" -days 365 -out ca.crt

# Create Server Cert
openssl genrsa -out tls.key 2048
openssl req -new -key tls.key -subj "/CN=hello-mtls-app" -out server.csr
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out tls.crt -days 365 -sha256

# Create Client Cert
openssl genrsa -out client.key 2048
openssl req -new -key client.key -subj "/CN=mtls-client" -out client.csr
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt -days 365 -sha256
```

---

## 🧱 Kubernetes Secret
Once certificates are ready, create the Kubernetes secret:

```bash
kubectl create secret generic mtls-certs   --from-file=certs/tls.key   --from-file=certs/tls.crt   --from-file=certs/ca.crt
```

Also create the ECR registry secret:
```bash
kubectl create secret docker-registry regcred   --docker-server=837735292605.dkr.ecr.us-east-2.amazonaws.com   --docker-username=AWS   --docker-password="$(aws ecr get-login-password --region us-east-2)"
```

---

## 🐳 Build & Push Docker Image
1. **Build the image:**
   ```bash
   docker build -t hello-mtls-app .
   ```

2. **Tag and push to ECR:**
   ```bash
   docker tag hello-mtls-app:latest 837735292605.dkr.ecr.us-east-2.amazonaws.com/hello-mtls-app:latest
   docker push 837735292605.dkr.ecr.us-east-2.amazonaws.com/hello-mtls-app:latest
   ```

---

## ☸️ Deploy to Kubernetes
Apply the deployment and verify pods:
```bash
kubectl apply -f deployment.yaml
kubectl get pods
```

✅ Example output:
```
NAME                              READY   STATUS    RESTARTS   AGE
hello-mtls-app-568689d579-splhz   1/1     Running   0          3s
hello-mtls-app-568689d579-wcc6t   1/1     Running   0          5s
```

---

## 🔁 Port Forwarding & Verification

Forward traffic from your local machine to the service:
```bash
kubectl port-forward deployment/hello-mtls-app 8443:8443
```

Test with client certificate authentication:
```bash
curl --cacert certs/ca.crt      --cert certs/client.crt      --key certs/client.key      --resolve hello-mtls-app:8443:127.0.0.1      https://hello-mtls-app:8443
```

✅ Expected output:
```
Hello World from mTLS-secured app on Kubernetes!
```

---

## 📦 Example Directory Structure
```
hello-mtls-eks/
│
├── app/
│   ├── server.js
│   ├── Dockerfile
│   └── certs/
│       ├── ca.crt
│       ├── ca.key
│       ├── client.crt
│       ├── client.key
│       ├── tls.crt
│       └── tls.key
│
├── infra/
│   └── terraform/
│       ├── main.tf
│       ├── outputs.tf
│       ├── variables.tf
│       └── modules/
│
└── k8s/
    ├── deployment.yaml
    └── secret.yaml
```

---

## ✅ Summary
- AWS EKS cluster provisioned via Terraform  
- Docker image built and pushed to ECR  
- Self-signed mTLS certificates created  
- Application deployed and verified via Kubernetes  
- End-to-end secure communication confirmed via curl  

---

**Repository:** [https://github.com/venuganginenidevops-cyber/hello-mtls-eks](https://github.com/venuganginenidevops-cyber/hello-mtls-eks)
