"""Middleware de encabezados de seguridad personalizados."""

from django.conf import settings


def _join_directives(directives):
    return '; '.join(f'{name} {" ".join(values)}'.strip() for name, values in directives)


def build_content_security_policy():
    script_sources = [
        "'self'",
        'https://accounts.google.com',
        'https://www.gstatic.com',
    ]

    style_sources = [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
    ]

    font_sources = [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
    ]

    img_sources = [
        "'self'",
        'data:',
        'blob:',
        'https://lh3.googleusercontent.com',
        'https://www.google.com',
    ]

    connect_sources = [
        "'self'",
        'https://accounts.google.com',
        'https://www.googleapis.com',
        'https://oauth2.googleapis.com',
        'ws:',
        'wss:',
    ]

    frame_sources = [
        "'self'",
        'https://accounts.google.com',
    ]

    media_sources = [
        "'self'",
        'data:',
        'blob:',
    ]

    worker_sources = [
        "'self'",
        'blob:',
    ]

    if settings.DEBUG:
        script_sources.append("'unsafe-eval'")
        connect_sources.extend([
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://localhost:3002',
            'http://127.0.0.1:3002',
            'http://localhost:3003',
            'http://127.0.0.1:3003',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
        ])

    directives = [
        ('default-src', ["'self'"]),
        ('base-uri', ["'self'"]),
        ('object-src', ["'none'"]),
        ('frame-ancestors', ["'none'"]),
        ('form-action', ["'self'"]),
        ('script-src', script_sources),
        ('style-src', style_sources),
        ('img-src', img_sources),
        ('font-src', font_sources),
        ('connect-src', connect_sources),
        ('frame-src', frame_sources),
        ('media-src', media_sources),
        ('worker-src', worker_sources),
    ]

    if not settings.DEBUG:
        directives.append(('upgrade-insecure-requests', []))

    return _join_directives(directives)


def build_permissions_policy():
    return ', '.join([
        'accelerometer=()',
        'autoplay=()',
        'camera=()',
        'clipboard-read=()',
        'clipboard-write=()',
        'display-capture=()',
        'encrypted-media=()',
        'fullscreen=()',
        'geolocation=()',
        'gyroscope=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'usb=()',
        'xr-spatial-tracking=()',
    ])


class SecurityHeadersMiddleware:
    """Añade encabezados de seguridad que Django no cubre por defecto."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if 'Content-Security-Policy' not in response:
            response['Content-Security-Policy'] = build_content_security_policy()

        if 'Permissions-Policy' not in response:
            response['Permissions-Policy'] = build_permissions_policy()

        if 'X-XSS-Protection' not in response:
            response['X-XSS-Protection'] = '0'

        return response