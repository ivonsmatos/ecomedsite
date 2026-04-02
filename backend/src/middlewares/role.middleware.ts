import { Request, Response, NextFunction } from 'express'

export function exigirPerfil(...perfis: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' })
      return
    }

    // Admin tem acesso a tudo
    if (req.usuario.perfil === 'ADMIN' || perfis.includes(req.usuario.perfil)) {
      next()
      return
    }

    res.status(403).json({ error: 'Acesso negado: perfil insuficiente' })
  }
}
