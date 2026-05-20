from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.usuarios.models import Usuario
from apps.perfiles.models import PerfilTrabajador

# Import trabajo models if they exist
try:
    from apps.trabajos.models import Trabajo, Cotizacion
    JOBS_AVAILABLE = True
except ImportError:
    JOBS_AVAILABLE = False


class Command(BaseCommand):
    help = 'Create additional seed data: jobs, quotations'

    def handle(self, *args, **options):
        if not JOBS_AVAILABLE:
            print("\n⚠️  No se encontró el modelo Trabajo")
            print("Verifica que la app 'trabajos' esté creada e instalada en settings.py\n")
            return

        print("\n" + "="*70)
        print("📋 CREANDO DATOS ADICIONALES (TRABAJOS Y COTIZACIONES)")
        print("="*70)

        # Get test usuarios
        cliente = Usuario.objects.filter(email='cliente@test.com', rol='cliente').first()
        trabajador1 = Usuario.objects.filter(email='trabajador1@test.com', rol='trabajador').first()
        trabajador2 = Usuario.objects.filter(email='trabajador2@test.com', rol='trabajador').first()

        if not all([cliente, trabajador1, trabajador2]):
            print("\n❌ Falta crear los usuarios de prueba primero")
            print("Ejecuta: python manage.py check_and_seed_db")
            return

        # Create Jobs
        print("\n[1] Creando solicitudes de trabajo...")
        
        trabajo1_data = {
            'cliente': cliente,
            'titulo': 'Reparación de tubería rota',
            'descripcion': 'Se rompió una tubería en el baño, necesito reparación urgente. Es un daño en la pared.',
            'categoria': 'plomeria',
            'ubicacion': 'Calle Principal 123, Colima',
            'presupuesto_estimado': 500.00,
            'fecha_inicio': timezone.now() + timedelta(days=2),
            'estado': 'activa'
        }
        
        trabajo1, created1 = Trabajo.objects.get_or_create(
            cliente=cliente,
            titulo='Reparación de tubería rota',
            defaults=trabajo1_data
        )
        status1 = "✓ Creada" if created1 else "ℹ Existente"
        print(f"   {status1}: {trabajo1.titulo}")

        trabajo2_data = {
            'cliente': cliente,
            'titulo': 'Instalación de nuevo circuito eléctrico',
            'descripcion': 'Necesito instalar un nuevo circuito para la cocina. La casa tiene 20 años.',
            'categoria': 'electricidad',
            'ubicacion': 'Avenida Secundaria 456, Manzanillo',
            'presupuesto_estimado': 800.00,
            'fecha_inicio': timezone.now() + timedelta(days=3),
            'estado': 'activa'
        }
        
        trabajo2, created2 = Trabajo.objects.get_or_create(
            cliente=cliente,
            titulo='Instalación de nuevo circuito eléctrico',
            defaults=trabajo2_data
        )
        status2 = "✓ Creada" if created2 else "ℹ Existente"
        print(f"   {status2}: {trabajo2.titulo}")

        # Create Quotations
        print("\n[2] Creando cotizaciones...")

        cot1_data = {
            'trabajo': trabajo1,
            'trabajador': trabajador1,
            'descripcion': 'Reparación simple: cambio de sección dañada. Incluye materiales y mano de obra.',
            'monto': 350.00,
            'tiempo_estimado_dias': 1,
            'estado': 'pendiente'
        }
        
        cot1, created_cot1 = Cotizacion.objects.get_or_create(
            trabajo=trabajo1,
            trabajador=trabajador1,
            defaults=cot1_data
        )
        status_cot1 = "✓ Creada" if created_cot1 else "ℹ Existente"
        print(f"   {status_cot1}: {trabajo1.titulo} → {trabajador1.nombre_completo} ($350)")

        cot2_data = {
            'trabajo': trabajo2,
            'trabajador': trabajador2,
            'descripcion': 'Instalación profesional con materiales de calidad. Incluye pruebas y garantía.',
            'monto': 700.00,
            'tiempo_estimado_dias': 2,
            'estado': 'pendiente'
        }
        
        cot2, created_cot2 = Cotizacion.objects.get_or_create(
            trabajo=trabajo2,
            trabajador=trabajador2,
            defaults=cot2_data
        )
        status_cot2 = "✓ Creada" if created_cot2 else "ℹ Existente"
        print(f"   {status_cot2}: {trabajo2.titulo} → {trabajador2.nombre_completo} ($700)")

        print("\n" + "="*70)
        print("✅ DATOS ADICIONALES LISTOS")
        print("="*70)
        print("\n📝 RESUMEN DE DATOS DE PRUEBA:")
        print(f"   👥 Usuarios: 3 (clientes) + 2 (trabajadores)")
        print(f"   💼 Perfiles: 2 (Plomería, Electricidad)")
        print(f"   📋 Trabajos: {Trabajo.objects.count()}")
        print(f"   💰 Cotizaciones: {Cotizacion.objects.count()}")
        print("\n🎯 PRÓXIMOS PASOS:")
        print("   1. Inicia el backend: python manage.py runserver")
        print("   2. Inicia el frontend: cd frontend && npm start")
        print("   3. Login como cliente y busca trabajadores")
        print("   4. Crea un nuevo trabajo")
        print("   5. Recibe cotizaciones")
        print("   6. Acepta una cotización y abre chat\n")
