/**
 * Supabase generated types (hand-written — regenerar quando
 * PROJECT_ID + SUPABASE_ACCESS_TOKEN estiverem disponíveis:
 *   npx supabase gen types typescript --project-id $PROJECT_ID > types/database.ts
 *
 * Reflete supabase/migrations/0001_initial.sql (schema.md §2).
 * Estrutura seguindo exatamente o formato oficial do supabase gen types v2.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          name: string
          avatar_url: string
          bio: string | null
          blog_title: string
          blog_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url: string
          bio?: string | null
          blog_title?: string
          blog_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string
          bio?: string | null
          blog_title?: string
          blog_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profile_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          excerpt: string | null
          cover_url: string | null
          cover_alt: string | null
          content: Json
          content_html: string | null
          status: PostStatus
          scheduled_at: string | null
          published_at: string | null
          views_count: number
          likes_count: number
          reading_time: number | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          excerpt?: string | null
          cover_url?: string | null
          cover_alt?: string | null
          content?: Json
          content_html?: string | null
          status?: PostStatus
          scheduled_at?: string | null
          published_at?: string | null
          views_count?: number
          likes_count?: number
          reading_time?: number | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          cover_url?: string | null
          cover_alt?: string | null
          content?: Json
          content_html?: string | null
          status?: PostStatus
          scheduled_at?: string | null
          published_at?: string | null
          views_count?: number
          likes_count?: number
          reading_time?: number | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profile'
            referencedColumns: ['id']
          },
        ]
      }
      post_categories: {
        Row: {
          post_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_categories_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          identifier_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          identifier_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          identifier_hash?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          session_hash: string
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          session_hash: string
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          session_hash?: string
          referrer?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_views_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      v_popular_posts: {
        Row: {
          id: string | null
          slug: string | null
          title: string | null
          cover_url: string | null
          published_at: string | null
          recent_views: number | null
        }
        Relationships: []
      }
      v_admin_stats: {
        Row: {
          total_published: number | null
          total_drafts: number | null
          views_30d: number | null
          likes_30d: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      publish_scheduled_posts: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: {
      post_status: PostStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
