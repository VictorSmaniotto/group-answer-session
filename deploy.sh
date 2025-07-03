#!/bin/bash

# Quiz Interativo - Script de Deploy para Digital Ocean
# Criado por @VictorSmaniotto

set -e  # Exit on any error

echo "🚀 Iniciando deploy do Quiz Interativo..."
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="quiz-interativo"
VERSION=${1:-latest}
REGISTRY_URL="registry.digitalocean.com/quiz-interativo-registry"

echo -e "${BLUE}📋 Configurações:${NC}"
echo "   - Imagem: $IMAGE_NAME:$VERSION"
echo "   - Registry: $REGISTRY_URL"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker primeiro.${NC}"
    exit 1
fi

# Build the image
echo -e "${YELLOW}📦 Construindo imagem Docker...${NC}"
docker build -t $IMAGE_NAME:$VERSION .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Imagem construída com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao construir a imagem.${NC}"
    exit 1
fi

# Tag for registry
echo -e "${YELLOW}🏷️ Fazendo tag da imagem para o registry...${NC}"
docker tag $IMAGE_NAME:$VERSION $REGISTRY_URL/$IMAGE_NAME:$VERSION
docker tag $IMAGE_NAME:$VERSION $REGISTRY_URL/$IMAGE_NAME:latest

# Deploy PartyKit (if partykit.json exists)
if [ -f "partykit.json" ]; then
    echo -e "${YELLOW}🎉 Fazendo deploy do PartyKit...${NC}"
    npx partykit deploy --name quiz-interativo
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PartyKit deployado com sucesso!${NC}"
    else
        echo -e "${RED}❌ Erro no deploy do PartyKit.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ partykit.json não encontrado, pulando deploy do PartyKit.${NC}"
fi

# Push to registry (commented out - requires authentication)
echo -e "${YELLOW}⬆️ Para fazer push para o registry:${NC}"
echo "   1. Configure a autenticação: doctl registry login"
echo "   2. Execute: docker push $REGISTRY_URL/$IMAGE_NAME:$VERSION"
echo "   3. Execute: docker push $REGISTRY_URL/$IMAGE_NAME:latest"

echo ""
echo -e "${GREEN}✅ Build local concluído com sucesso!${NC}"
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo "   1. Faça push da imagem para o registry"
echo "   2. Configure o servidor Digital Ocean"
echo "   3. Execute docker-compose up -d no servidor"
echo ""
echo -e "${GREEN}🎯 Deploy preparado por @VictorSmaniotto${NC}"
