// Google Contacts (People API) 服務

import { google, people_v1 } from "googleapis";
import { getAuthClient } from "./auth";

function getPeople() {
  return google.people({ version: "v1", auth: getAuthClient() });
}

const PERSON_FIELDS = "names,emailAddresses,phoneNumbers,organizations,addresses,birthdays,biographies";

export async function listContacts(
  options: {
    pageSize?: number;
    pageToken?: string;
  } = {}
) {
  const people = getPeople();
  const res = await people.people.connections.list({
    resourceName: "people/me",
    pageSize: options.pageSize || 100,
    pageToken: options.pageToken,
    personFields: PERSON_FIELDS,
    sortOrder: "LAST_MODIFIED_DESCENDING",
  });

  return {
    contacts: res.data.connections || [],
    nextPageToken: res.data.nextPageToken,
  };
}

export async function searchContacts(query: string) {
  const people = getPeople();
  const res = await people.people.searchContacts({
    query,
    readMask: PERSON_FIELDS,
  });

  return res.data.results?.map((r) => r.person) || [];
}

export async function getContact(resourceName: string) {
  const people = getPeople();
  const res = await people.people.get({
    resourceName,
    personFields: PERSON_FIELDS,
  });
  return res.data;
}

export async function createContact(contact: {
  givenName: string;
  familyName?: string;
  email?: string;
  phone?: string;
  organization?: string;
}) {
  const people = getPeople();

  const person: people_v1.Schema$Person = {
    names: [
      {
        givenName: contact.givenName,
        familyName: contact.familyName,
      },
    ],
  };

  if (contact.email) {
    person.emailAddresses = [{ value: contact.email }];
  }

  if (contact.phone) {
    person.phoneNumbers = [{ value: contact.phone }];
  }

  if (contact.organization) {
    person.organizations = [{ name: contact.organization }];
  }

  const res = await people.people.createContact({
    requestBody: person,
  });

  return res.data;
}

export async function updateContact(
  resourceName: string,
  contact: {
    givenName?: string;
    familyName?: string;
    email?: string;
    phone?: string;
  },
  etag: string
) {
  const people = getPeople();

  const updatePersonFields: string[] = [];
  const person: people_v1.Schema$Person = { etag };

  if (contact.givenName || contact.familyName) {
    person.names = [
      {
        givenName: contact.givenName,
        familyName: contact.familyName,
      },
    ];
    updatePersonFields.push("names");
  }

  if (contact.email) {
    person.emailAddresses = [{ value: contact.email }];
    updatePersonFields.push("emailAddresses");
  }

  if (contact.phone) {
    person.phoneNumbers = [{ value: contact.phone }];
    updatePersonFields.push("phoneNumbers");
  }

  const res = await people.people.updateContact({
    resourceName,
    updatePersonFields: updatePersonFields.join(","),
    requestBody: person,
  });

  return res.data;
}

export async function deleteContact(resourceName: string) {
  const people = getPeople();
  await people.people.deleteContact({ resourceName });
}

export type { people_v1 };
