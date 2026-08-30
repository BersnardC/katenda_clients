import { api } from "@/lib/api";
import type { Contact, ContactData } from "@/types/models";

// Polymorphic contacts: /{type}/{uuid}/contacts (type ∈ stores|products|categories)
export const contactService = {
  // GET /{type}/{uuid}/contacts -> { contacts: Contact[] }
  list: (type: string, uuid: string) =>
    api.get<{ contacts: Contact[] }>(`/${type}/${uuid}/contacts`),
  // POST /{type}/{uuid}/contacts -> { contact: Contact } 201
  create: (type: string, uuid: string, data: ContactData) =>
    api.post<{ contact: Contact }>(`/${type}/${uuid}/contacts`, data),
  // PUT /{type}/{uuid}/contacts/{contactUuid} -> { contact: Contact }
  update: (
    type: string,
    uuid: string,
    contactUuid: string,
    data: Partial<ContactData>,
  ) =>
    api.put<{ contact: Contact }>(
      `/${type}/${uuid}/contacts/${contactUuid}`,
      data,
    ),
  // DELETE /{type}/{uuid}/contacts/{contactUuid} -> { message }
  destroy: (type: string, uuid: string, contactUuid: string) =>
    api.delete<{ message: string }>(
      `/${type}/${uuid}/contacts/${contactUuid}`,
    ),
};
