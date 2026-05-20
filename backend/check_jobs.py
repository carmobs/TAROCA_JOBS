#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.trabajos.models import Trabajo
from apps.usuarios.models import Usuario

# List all jobs
jobs = Trabajo.objects.all()
print(f'Total jobs in DB: {jobs.count()}')
for job in jobs:
    print(f'  - ID={job.id}, Title={job.titulo}, Cliente={job.cliente.email if job.cliente else "None"}, Estado={job.estado}')

# Check specific client
client = Usuario.objects.filter(email='cliente2_1778695941130@test.com').first()
if client:
    client_jobs = Trabajo.objects.filter(cliente=client)
    print(f'\nJobs for {client.email}: {client_jobs.count()}')
    for job in client_jobs:
        print(f'  - ID={job.id}, Title={job.titulo}')
