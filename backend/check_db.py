import os
import sys

# Change to backend directory
backend_path = r"C:\Users\Colibecas\Desktop\app de conexion con trabajadores\backend"
os.chdir(backend_path)
sys.path.insert(0, backend_path)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import models
from apps.usuarios.models import Usuario
from apps.perfiles.models import PerfilTrabajador

print("\n" + "="*60)
print("📊 ESTADO ACTUAL DE LA BASE DE DATOS")
print("="*60)

print(f"\n👥 USUARIOS REGISTRADOS: {Usuario.objects.count()}")
for u in Usuario.objects.all():
    print(f"   • {u.email} ({u.rol}) - Verificado: {u.is_verificado}")

print(f"\n💼 PERFILES TRABAJADOR: {PerfilTrabajador.objects.count()}")
for p in PerfilTrabajador.objects.all():
    print(f"   • {p.usuario.nombre_completo} - {p.get_categoria_display()}")

print(f"\n{'='*60}\n")
