import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ParentRole, Permission } from './modules/auth/entities';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    // Uncomment this block if you ever want to delete all tables when the app starts
    // try {
    //   console.log('🧨 Dropping all tables...');
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
    //   console.log('✅ All tables were dropped successfully.');
    // } catch (error) {
    //   console.error('❌ Error while dropping tables:', error);
    // }
    await this.seedParentRoles();
    await this.seedPermissions();
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
      }
    }
  }

  // 👇 New method to seed fixed permissions
  private async seedPermissions() {
    const permissionRepository = this.dataSource.getRepository(Permission);

    const permissionGroups = [
      {
        group: 'users',
        actions: ['create', 'update', 'delete'],
      },
      {
        group: 'products',
        actions: ['create', 'update', 'delete'],
      },
      {
        group: 'ranges',
        actions: ['create', 'update', 'delete'],
      },
    ];

    for (const { group, actions } of permissionGroups) {
      for (const action of actions) {
        const permissionName = `${action} ${group}`;

        const existingPermission = await permissionRepository.findOne({
          where: { name: permissionName },
        });

        if (!existingPermission) {
          const newPermission = permissionRepository.create({
            name: permissionName,
            description: `Allows the user to ${action} ${group}`,
            group,
          });

          await permissionRepository.save(newPermission);
        }
      }
    }
  }
}
