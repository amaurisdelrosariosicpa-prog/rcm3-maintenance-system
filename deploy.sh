#!/bin/bash

# RCM3 Sistema de Mantenimiento - Deployment Script
# Este script facilita el despliegue en diferentes proveedores de nube

set -e

echo "🚀 RCM3 Sistema de Mantenimiento - Script de Despliegue"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo "Uso: ./deploy.sh [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  local       Despliegue local con Docker Compose"
    echo "  aws         Despliegue en AWS (ECS + RDS)"
    echo "  gcp         Despliegue en Google Cloud Platform"
    echo "  azure       Despliegue en Microsoft Azure"
    echo "  heroku      Despliegue en Heroku"
    echo "  vercel      Despliegue en Vercel"
    echo "  netlify     Despliegue en Netlify"
    echo "  digitalocean Despliegue en DigitalOcean"
    echo "  railway     Despliegue en Railway"
    echo "  render      Despliegue en Render"
    echo "  help        Mostrar esta ayuda"
    echo ""
}

# Función para verificar dependencias
check_dependencies() {
    local deps=("$@")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${RED}❌ $dep no está instalado${NC}"
            exit 1
        fi
    done
}

# Función para crear archivo .env si no existe
create_env_file() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}📝 Creando archivo .env desde .env.example${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Por favor, edita el archivo .env con tus configuraciones${NC}"
        read -p "Presiona Enter cuando hayas configurado el archivo .env..."
    fi
}

# Despliegue local
deploy_local() {
    echo -e "${BLUE}🏠 Iniciando despliegue local...${NC}"
    
    check_dependencies "docker" "docker-compose"
    create_env_file
    
    echo "📦 Construyendo imágenes Docker..."
    docker-compose build
    
    echo "🚀 Iniciando servicios..."
    docker-compose up -d
    
    echo -e "${GREEN}✅ Despliegue local completado${NC}"
    echo -e "${GREEN}🌐 Aplicación disponible en: http://localhost:3000${NC}"
    echo -e "${GREEN}📊 API disponible en: http://localhost:3001${NC}"
}

# Despliegue en AWS
deploy_aws() {
    echo -e "${BLUE}☁️  Iniciando despliegue en AWS...${NC}"
    
    check_dependencies "aws" "docker"
    
    echo "📝 Configurando AWS ECS..."
    # Aquí irían los comandos específicos de AWS
    echo -e "${YELLOW}⚠️  Configuración de AWS ECS pendiente de implementar${NC}"
    echo "📖 Consulta la documentación para configuración manual"
}

# Despliegue en Heroku
deploy_heroku() {
    echo -e "${BLUE}🟣 Iniciando despliegue en Heroku...${NC}"
    
    check_dependencies "heroku"
    
    echo "📦 Creando aplicación en Heroku..."
    heroku create rcm3-sistema-$(date +%s) || true
    
    echo "🔧 Configurando variables de entorno..."
    heroku config:set NODE_ENV=production
    
    echo "🚀 Desplegando aplicación..."
    git push heroku main || git push heroku master
    
    echo -e "${GREEN}✅ Despliegue en Heroku completado${NC}"
}

# Despliegue en Vercel
deploy_vercel() {
    echo -e "${BLUE}▲ Iniciando despliegue en Vercel...${NC}"
    
    check_dependencies "vercel"
    
    echo "🚀 Desplegando en Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✅ Despliegue en Vercel completado${NC}"
}

# Despliegue en Railway
deploy_railway() {
    echo -e "${BLUE}🚂 Iniciando despliegue en Railway...${NC}"
    
    check_dependencies "railway"
    
    echo "🚀 Desplegando en Railway..."
    railway login
    railway deploy
    
    echo -e "${GREEN}✅ Despliegue en Railway completado${NC}"
}

# Despliegue en DigitalOcean
deploy_digitalocean() {
    echo -e "${BLUE}🌊 Iniciando despliegue en DigitalOcean...${NC}"
    
    check_dependencies "doctl"
    
    echo "📝 Configurando DigitalOcean App Platform..."
    echo -e "${YELLOW}⚠️  Configuración de DigitalOcean pendiente de implementar${NC}"
    echo "📖 Consulta la documentación para configuración manual"
}

# Función principal
main() {
    case "${1:-help}" in
        "local")
            deploy_local
            ;;
        "aws")
            deploy_aws
            ;;
        "gcp")
            echo -e "${YELLOW}⚠️  Despliegue en GCP pendiente de implementar${NC}"
            ;;
        "azure")
            echo -e "${YELLOW}⚠️  Despliegue en Azure pendiente de implementar${NC}"
            ;;
        "heroku")
            deploy_heroku
            ;;
        "vercel")
            deploy_vercel
            ;;
        "netlify")
            echo -e "${YELLOW}⚠️  Despliegue en Netlify pendiente de implementar${NC}"
            ;;
        "digitalocean")
            deploy_digitalocean
            ;;
        "railway")
            deploy_railway
            ;;
        "render")
            echo -e "${YELLOW}⚠️  Despliegue en Render pendiente de implementar${NC}"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"