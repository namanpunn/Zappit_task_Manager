"use client";

import { OrganizationList, useOrganization, Organization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Onboarding() {
  const { organization }: { organization: Organization | null } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      router.push(`/organization/${organization.slug}`);
    }
  }, [organization, router]);

  return (
    <div className="flex justify-center items-center pt-14">
      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/organization/:slug"
        afterSelectOrganizationUrl="/organization/:slug"
      />
    </div>
  );
}
