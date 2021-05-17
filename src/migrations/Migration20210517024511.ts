import { Migration } from '@mikro-orm/migrations';

export class Migration20210517024511 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user` (`id` varchar(255) not null, `created_at` datetime not null, `owner` varchar(255) not null, `updated_at` datetime not null, `name` varchar(255) not null, `last_name` varchar(255) not null, `picture` varchar(255) null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user` add primary key `user_pkey`(`id`);');

    this.addSql('create table `auth_provider` (`id` varchar(255) not null, `created_at` datetime not null, `owner` varchar(255) not null, `updated_at` datetime not null, `user_name` varchar(255) not null, `password` varchar(255) null, `email` varchar(255) not null, `provider` enum(\'Email\', \'Gmail\') not null default \'Email\', `verified_code` int(11) not null, `verified` tinyint(1) not null default false, `user_id` varchar(255) null, `role` text not null default \'User\', `password_changed_at` datetime null, `password_reset_expires` datetime null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `auth_provider` add primary key `auth_provider_pkey`(`id`);');
    this.addSql('alter table `auth_provider` add unique `auth_provider_user_name_unique`(`user_name`);');
    this.addSql('alter table `auth_provider` add unique `auth_provider_email_unique`(`email`);');
    this.addSql('alter table `auth_provider` add index `auth_provider_user_id_index`(`user_id`);');
    this.addSql('alter table `auth_provider` add unique `auth_provider_user_id_unique`(`user_id`);');

    this.addSql('alter table `auth_provider` add constraint `auth_provider_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade on delete set null;');
  }

}
