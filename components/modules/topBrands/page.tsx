import { ProviderWithUser } from "@/types/user.type";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Store, Mail, Phone, MapPin, ChefHat, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TProvidersPageProps {
  readonly providers: ProviderWithUser[];
}

export default function TopBrands({ providers }: TProvidersPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Top Food Providers</h1>
        <p className="text-muted-foreground">
          Discover our trusted restaurant partners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const initials =
            provider.providerProfile?.providerName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "PR";

          return (
            <Link href={`/topbrands/${provider.id}`}
                key={provider.id}
                className="hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer">
              <Card
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage
                        src={provider.image || ""}
                        alt={provider.providerProfile?.providerName || ""}
                      />
                      <AvatarFallback className="text-lg font-semibold bg-primary/10">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {provider.providerProfile?.providerName || "N/A"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            provider.accountStatus === "ACTIVE"
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {provider.accountStatus}
                        </Badge>
                        {provider.emailVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {provider.providerProfile?.ownerName || "N/A"}
                      </p>
                      <p className="text-muted-foreground text-xs">Owner</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">
                      {provider.providerProfile?.providerEmail || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {provider.providerProfile?.providerContact || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">
                      {provider.providerProfile?.providerAddress || "N/A"}
                    </span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">
                        {provider.providerProfile?._count?.meals || 0}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {provider.providerProfile?._count?.meals === 1
                          ? "Meal"
                          : "Meals"}{" "}
                        Available
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <Button className="w-full cursor-pointer">Explore Their Meals</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Providers Found</h3>
          <p className="text-muted-foreground">
            There are no food providers available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
