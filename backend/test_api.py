#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from apps.usuarios.models import Usuario
from apps.trabajos.models import Trabajo
from apps.trabajos.serializers import TrabajoSerializer

# Get the client
client = Usuario.objects.get(email='cliente2_1778695941130@test.com')

# Get their jobs
jobs = Trabajo.objects.filter(cliente=client)

# Serialize
serializer = TrabajoSerializer(jobs, many=True)
print("Jobs via API serializer:")
print(json.dumps(serializer.data, indent=2, default=str))
