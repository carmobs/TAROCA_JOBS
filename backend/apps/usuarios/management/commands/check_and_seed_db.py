from django.core.management.base import BaseCommand
from apps.usuarios.models import Usuario
from apps.perfiles.models import PerfilTrabajador


class Command(BaseCommand):
    help = 'Inspect DB and create seed data'

    def handle(self, *args, **options):
        print("\n" + "="*70)
        print("📊 ESTADO ACTUAL DE LA BASE DE DATOS")
        print("="*70)

        # Check users
        user_count = Usuario.objects.count()
        print(f"\n👥 USUARIOS REGISTRADOS: {user_count}")
        if user_count > 0:
            for u in Usuario.objects.all():
                print(f"   • {u.email} ({u.rol}) - Verificado: {u.is_verificado}")
        else:
            print("   ❌ No hay usuarios registrados")

        # Check worker profiles
        profile_count = PerfilTrabajador.objects.count()
        print(f"\n💼 PERFILES TRABAJADOR: {profile_count}")
        if profile_count > 0:
            for p in PerfilTrabajador.objects.all():
                print(f"   • {p.usuario.nombre_completo} - {p.get_categoria_display()}")
        else:
            print("   ❌ No hay perfiles de trabajador")

        # Check if we need more workers
        if profile_count == 0:
            print("\n" + "="*70)
            print("🌱 CREANDO DATOS DE PRUEBA (TRABAJADORES)...")
            print("="*70)
            
            # Get or create cliente
            print("\n[1] Verificando usuario cliente...")
            cliente, created = Usuario.objects.get_or_create(
                email='cliente@test.com',
                defaults={
                    'password': 'TestPassword123!',
                    'nombre': 'Juan',
                    'apellido': 'Cliente',
                    'rol': 'cliente',
                    'is_verificado': True,
                    'telefono': '+34123456789'
                }
            )
            if created:
                cliente.set_password('TestPassword123!')
                cliente.save()
                print(f"   ✓ Cliente creado: {cliente.email}")
            else:
                print(f"   ℹ Cliente ya existe: {cliente.email}")
            
            # Trabajador user 1
            print("\n[2] Creando trabajador 1...")
            trabajador1, created = Usuario.objects.get_or_create(
                email='trabajador1@test.com',
                defaults={
                    'nombre': 'Carlos',
                    'apellido': 'Plomero',
                    'rol': 'trabajador',
                    'is_verificado': True,
                    'telefono': '+34987654321'
                }
            )
            if created:
                trabajador1.set_password('TestPassword123!')
                trabajador1.save()
                print(f"   ✓ Trabajador 1 creado: {trabajador1.email}")
            else:
                print(f"   ℹ Trabajador 1 ya existe: {trabajador1.email}")
            
            # Trabajador user 2
            print("\n[3] Creando trabajador 2...")
            trabajador2, created = Usuario.objects.get_or_create(
                email='trabajador2@test.com',
                defaults={
                    'nombre': 'María',
                    'apellido': 'Electricista',
                    'rol': 'trabajador',
                    'is_verificado': True,
                    'telefono': '+34666555444'
                }
            )
            if created:
                trabajador2.set_password('TestPassword123!')
                trabajador2.save()
                print(f"   ✓ Trabajador 2 creado: {trabajador2.email}")
            else:
                print(f"   ℹ Trabajador 2 ya existe: {trabajador2.email}")
            
            # Create worker profiles
            print("\n[4] Creando perfiles de trabajador...")
            
            if not PerfilTrabajador.objects.filter(usuario=trabajador1).exists():
                perfil1 = PerfilTrabajador.objects.create(
                    usuario=trabajador1,
                    categoria='plomeria',
                    especialidades=['Reparación de tuberías', 'Instalación de grifería', 'Desatascos'],
                    experiencia_anos=8,
                    descripcion='Plomero con más de 8 años de experiencia en reparaciones y nuevas instalaciones. Servicio rápido y profesional.',
                    ubicacion='Calle Principal 123, Colima',
                    zona_servicio=['Colima', 'Villa de Álvarez'],
                    tarifa_hora=25.00,
                    tarifa_minima=50.00,
                    calificacion_promedio=4.8,
                    total_trabajos=45,
                    total_resenas=42,
                    disponible=True,
                    identidad_verificada=True,
                    domicilio_verificado=True
                )
                print(f"   ✓ Perfil 1 creado: {perfil1.usuario.nombre_completo} (Plomería)")
            else:
                print(f"   ℹ Perfil 1 ya existe para {trabajador1.nombre_completo}")
            
            if not PerfilTrabajador.objects.filter(usuario=trabajador2).exists():
                perfil2 = PerfilTrabajador.objects.create(
                    usuario=trabajador2,
                    categoria='electricidad',
                    especialidades=['Instalaciones eléctricas', 'Reparación de aparatos', 'Mantenimiento'],
                    experiencia_anos=6,
                    descripcion='Electricista certificada con experiencia en instalaciones residenciales y comerciales. Trabajo de calidad garantizado.',
                    ubicacion='Avenida Secundaria 456, Manzanillo',
                    zona_servicio=['Manzanillo', 'Colima', 'Cómala'],
                    tarifa_hora=30.00,
                    tarifa_minima=60.00,
                    calificacion_promedio=4.9,
                    total_trabajos=38,
                    total_resenas=36,
                    disponible=True,
                    identidad_verificada=True,
                    domicilio_verificado=True
                )
                print(f"   ✓ Perfil 2 creado: {perfil2.usuario.nombre_completo} (Electricidad)")
            else:
                print(f"   ℹ Perfil 2 ya existe para {trabajador2.nombre_completo}")
            
            print("\n" + "="*70)
            print("✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE")
            print("="*70)
            print("\n🔐 CREDENCIALES DE ACCESO PARA TESTING:")
            print(f"\n   👤 CLIENTE:")
            print(f"      Email: {cliente.email}")
            print(f"      Password: TestPassword123!")
            print(f"\n   🔧 TRABAJADOR 1 (Plomería):")
            print(f"      Email: {trabajador1.email}")
            print(f"      Password: TestPassword123!")
            print(f"\n   ⚡ TRABAJADOR 2 (Electricidad):")
            print(f"      Email: {trabajador2.email}")
            print(f"      Password: TestPassword123!")
            print("\n")
