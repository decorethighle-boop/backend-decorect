import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParentRole } from './auth/entities';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    // Descomentar el siguiente bloque para eliminar todas las tablas al iniciar la aplicación
    // try {
    //   console.log('🧨 Eliminando todas las tablas...');
    //   await this.dataSource.query(`
    //     DO $$
    //     DECLARE
    //         r RECORD;
    //     BEGIN
    //         FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    //             EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    //         END LOOP;
    //     END $$;
    //   `);
    //   console.log('✅ Todas las tablas fueron eliminadas exitosamente.');
    // } catch (error) {
    //   console.error('❌ Error al eliminar las tablas:', error);
    // }
    await this.seedParentRoles();
  }

  private async seedParentRoles() {
    const parentRoleRepository = this.dataSource.getRepository(ParentRole);

    const defaultParentRoles = [
      { name: 'user', hierarchy: 1 },
      { name: 'admin', hierarchy: 2 },
    ];

    for (const roleData of defaultParentRoles) {
      const existingRole = await parentRoleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const newRole = parentRoleRepository.create(roleData);
        await parentRoleRepository.save(newRole);
        console.log(`ParentRole ${roleData.name} creado exitosamente`);
      } else {
        console.log(`ParentRole ${roleData.name} ya existe, omitiendo...`);
      }
    }
  }
}
