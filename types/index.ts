export interface Client {
   id: number;
   message_id: number;
   language_code: string | null | undefined;
   type: string | null | undefined;
   username: string | null | undefined;
   first_name: string | null | undefined;
   is_bot: boolean | null | undefined;
   is_owner: boolean | null | undefined;
   is_media: boolean | null | undefined;
   media: object | null | undefined;
   message: string[] | null | undefined;
   quoted: object | null | undefined;
   quoted_message: object | null | undefined;
   args: string | null | undefined;
   base_url: string;
   api_key: string;
   prefix: string;
}
