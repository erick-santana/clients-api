#!/bin/bash

# Script para configurar infraestrutura de segurança AWS
# Uso: ./scripts/setup-aws-security.sh

set -e

echo "🔒 Configurando infraestrutura de segurança AWS..."

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não está instalado. Instale primeiro: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar se está logado na AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Não está logado na AWS. Execute: aws configure"
    exit 1
fi

# Configurações
REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="clientes"
VPC_CIDR="10.0.0.0/16"

echo "📍 Região: $REGION"
echo "🏗️  Projeto: $PROJECT_NAME"

# 1. Criar VPC
echo "🌐 Criando VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block $VPC_CIDR \
    --tag-specifications ResourceType=vpc,Tags=[{Key=Name,Value=$PROJECT_NAME-vpc}] \
    --query 'Vpc.VpcId' \
    --output text)

echo "✅ VPC criada: $VPC_ID"

# 2. Criar Internet Gateway
echo "🌍 Criando Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications ResourceType=internet-gateway,Tags=[{Key=Name,Value=$PROJECT_NAME-igw}] \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)

aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
echo "✅ Internet Gateway criado: $IGW_ID"

# 3. Criar Subnets
echo "🔗 Criando Subnets..."

# Subnets públicas
PUBLIC_SUBNET_1A=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${REGION}a \
    --tag-specifications ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-public-subnet-1a}] \
    --query 'Subnet.SubnetId' \
    --output text)

PUBLIC_SUBNET_1B=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${REGION}b \
    --tag-specifications ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-public-subnet-1b}] \
    --query 'Subnet.SubnetId' \
    --output text)

# Subnets privadas
PRIVATE_SUBNET_1A=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.10.0/24 \
    --availability-zone ${REGION}a \
    --tag-specifications ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-private-subnet-1a}] \
    --query 'Subnet.SubnetId' \
    --output text)

PRIVATE_SUBNET_1B=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.11.0/24 \
    --availability-zone ${REGION}b \
    --tag-specifications ResourceType=subnet,Tags=[{Key=Name,Value=$PROJECT_NAME-private-subnet-1b}] \
    --query 'Subnet.SubnetId' \
    --output text)

echo "✅ Subnets criadas:"
echo "   Públicas: $PUBLIC_SUBNET_1A, $PUBLIC_SUBNET_1B"
echo "   Privadas: $PRIVATE_SUBNET_1A, $PRIVATE_SUBNET_1B"

# 4. Criar Route Tables
echo "🛣️  Criando Route Tables..."

# Route table pública
PUBLIC_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications ResourceType=route-table,Tags=[{Key=Name,Value=$PROJECT_NAME-public-rt}] \
    --query 'RouteTable.RouteTableId' \
    --output text)

aws ec2 create-route \
    --route-table-id $PUBLIC_RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID

aws ec2 associate-route-table --route-table-id $PUBLIC_RT_ID --subnet-id $PUBLIC_SUBNET_1A
aws ec2 associate-route-table --route-table-id $PUBLIC_RT_ID --subnet-id $PUBLIC_SUBNET_1B

# Route table privada
PRIVATE_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications ResourceType=route-table,Tags=[{Key=Name,Value=$PROJECT_NAME-private-rt}] \
    --query 'RouteTable.RouteTableId' \
    --output text)

aws ec2 associate-route-table --route-table-id $PRIVATE_RT_ID --subnet-id $PRIVATE_SUBNET_1A
aws ec2 associate-route-table --route-table-id $PRIVATE_RT_ID --subnet-id $PRIVATE_SUBNET_1B

echo "✅ Route Tables criadas: $PUBLIC_RT_ID, $PRIVATE_RT_ID"

# 5. Criar Security Groups
echo "🛡️  Criando Security Groups..."

# Security Group para ALB
ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-alb-sg \
    --description "Security group for Application Load Balancer" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Security Group para ECS
ECS_SG_ID=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-ecs-sg \
    --description "Security group for ECS tasks" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 8080 \
    --source-group $ALB_SG_ID

# Security Group para RDS
RDS_SG_ID=$(aws ec2 create-security-group \
    --group-name $PROJECT_NAME-rds-sg \
    --description "Security group for RDS database" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG_ID \
    --protocol tcp \
    --port 3306 \
    --source-group $ECS_SG_ID

echo "✅ Security Groups criadas:"
echo "   ALB: $ALB_SG_ID"
echo "   ECS: $ECS_SG_ID"
echo "   RDS: $RDS_SG_ID"

# 6. Criar KMS Keys
echo "🔑 Criando KMS Keys..."

ENCRYPTION_KEY_ID=$(aws kms create-key \
    --description "$PROJECT_NAME encryption key" \
    --key-usage ENCRYPT_DECRYPT \
    --key-spec SYMMETRIC_DEFAULT \
    --query 'KeyMetadata.KeyId' \
    --output text)

aws kms create-alias \
    --alias-name alias/$PROJECT_NAME-encryption-key \
    --target-key-id $ENCRYPTION_KEY_ID

DB_KEY_ID=$(aws kms create-key \
    --description "$PROJECT_NAME database encryption key" \
    --key-usage ENCRYPT_DECRYPT \
    --key-spec SYMMETRIC_DEFAULT \
    --query 'KeyMetadata.KeyId' \
    --output text)

aws kms create-alias \
    --alias-name alias/$PROJECT_NAME-db-key \
    --target-key-id $DB_KEY_ID

echo "✅ KMS Keys criadas:"
echo "   Encryption: $ENCRYPTION_KEY_ID"
echo "   Database: $DB_KEY_ID"

# 7. Criar Cognito User Pool
echo "👥 Criando Cognito User Pool..."

USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name $PROJECT_NAME-user-pool \
    --policies PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true} \
    --auto-verified-attributes email \
    --username-attributes email \
    --query 'UserPool.Id' \
    --output text)

CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id $USER_POOL_ID \
    --client-name $PROJECT_NAME-client \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
    --query 'UserPoolClient.ClientId' \
    --output text)

echo "✅ Cognito User Pool criado:"
echo "   Pool ID: $USER_POOL_ID"
echo "   Client ID: $CLIENT_ID"

# 8. Criar Secrets Manager
echo "🔐 Criando Secrets Manager..."

DB_SECRET_ARN=$(aws secretsmanager create-secret \
    --name $PROJECT_NAME/db-credentials \
    --description "Database credentials" \
    --secret-string '{"username":"admin","password":"secure-password"}' \
    --query 'ARN' \
    --output text)

JWT_SECRET_ARN=$(aws secretsmanager create-secret \
    --name $PROJECT_NAME/jwt-secret \
    --description "JWT signing secret" \
    --secret-string "your-super-secret-jwt-key-here" \
    --query 'ARN' \
    --output text)

echo "✅ Secrets Manager criado:"
echo "   DB Credentials: $DB_SECRET_ARN"
echo "   JWT Secret: $JWT_SECRET_ARN"

# 9. Habilitar GuardDuty
echo "🕵️  Habilitando GuardDuty..."

DETECTOR_ID=$(aws guardduty create-detector \
    --enable \
    --finding-publishing-frequency FIFTEEN_MINUTES \
    --query 'DetectorId' \
    --output text)

echo "✅ GuardDuty habilitado: $DETECTOR_ID"

# 10. Habilitar Security Hub
echo "🔍 Habilitando Security Hub..."

aws securityhub enable-security-hub \
    --enable-default-standards

echo "✅ Security Hub habilitado"

# 11. Criar CloudTrail
echo "📝 Criando CloudTrail..."

TRAIL_NAME="$PROJECT_NAME-cloudtrail"
aws cloudtrail create-trail \
    --name $TRAIL_NAME \
    --s3-bucket-name $PROJECT_NAME-cloudtrail-logs \
    --include-global-service-events \
    --enable-log-file-validation

aws cloudtrail start-logging --name $TRAIL_NAME

echo "✅ CloudTrail criado: $TRAIL_NAME"

# Salvar configurações
echo "💾 Salvando configurações..."

cat > aws-security-config.json << EOF
{
  "vpc": {
    "id": "$VPC_ID",
    "cidr_block": "$VPC_CIDR"
  },
  "subnets": {
    "public": ["$PUBLIC_SUBNET_1A", "$PUBLIC_SUBNET_1B"],
    "private": ["$PRIVATE_SUBNET_1A", "$PRIVATE_SUBNET_1B"]
  },
  "security_groups": {
    "alb": "$ALB_SG_ID",
    "ecs": "$ECS_SG_ID",
    "rds": "$RDS_SG_ID"
  },
  "kms": {
    "encryption_key": "$ENCRYPTION_KEY_ID",
    "db_key": "$DB_KEY_ID"
  },
  "cognito": {
    "user_pool_id": "$USER_POOL_ID",
    "client_id": "$CLIENT_ID"
  },
  "secrets": {
    "db_credentials": "$DB_SECRET_ARN",
    "jwt_secret": "$JWT_SECRET_ARN"
  },
  "monitoring": {
    "guardduty_detector": "$DETECTOR_ID",
    "cloudtrail": "$TRAIL_NAME"
  }
}
EOF

echo "✅ Configurações salvas em aws-security-config.json"

echo ""
echo "🎉 Infraestrutura de segurança AWS configurada com sucesso!"
echo ""
echo "📋 Resumo:"
echo "   🌐 VPC: $VPC_ID"
echo "   🛡️  Security Groups: ALB($ALB_SG_ID), ECS($ECS_SG_ID), RDS($RDS_SG_ID)"
echo "   🔑 KMS Keys: Encryption($ENCRYPTION_KEY_ID), DB($DB_KEY_ID)"
echo "   👥 Cognito: Pool($USER_POOL_ID), Client($CLIENT_ID)"
echo "   🔐 Secrets: DB($DB_SECRET_ARN), JWT($JWT_SECRET_ARN)"
echo "   🕵️  GuardDuty: $DETECTOR_ID"
echo "   📝 CloudTrail: $TRAIL_NAME"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Configure as variáveis de ambiente com os IDs gerados"
echo "   - Atualize o arquivo .env com as configurações"
echo "   - Configure o WAF e Shield conforme necessário"
echo "   - Revise as políticas de IAM para seguir o princípio do menor privilégio"
