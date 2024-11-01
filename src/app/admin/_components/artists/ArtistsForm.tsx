"use client";
import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  artistSchema,
  ArtistFormValues,
} from "../../validation/artists-validation";
import { toUpperCase } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { MultiSelect } from "@/components/ui/multi-select";
import { Cat, Dog, Fish, Rabbit, Turtle } from "lucide-react";
import { SocialMediaPlatforms } from "@prisma/client";
import addArtist from "../../_actions/add-artists";
import { useToast } from "@/hooks/use-toast";

const frameworksList = [
  { value: "react", label: "React", icon: Turtle },
  { value: "angular", label: "Angular", icon: Cat },
  { value: "vue", label: "Vue", icon: Dog },
  { value: "svelte", label: "Svelte", icon: Rabbit },
  { value: "ember", label: "Ember", icon: Fish },
];

interface ArtistsFormProps {}

const ArtistsForm: React.FC<ArtistsFormProps> = ({}) => {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  // 1. Define your form.
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nickName: "",
      image: "",
      wins: undefined,
      loses: undefined,
      bio: "",
      quotes: [""], // Initialize with one empty quote
      socialMedia: [
        {
          name: "FACEBOOK",
          url: "",
        },
      ],
      battlesParticipated: [],
      seasonsWon: [],
      battlesWon: [],
    },
  });
  const [image, setImage] = React.useState<string | undefined>(
    form.watch("image")
  );

  // 2. Define a submit handler.
  function onSubmit(values: ArtistFormValues) {
    startTransition(async () => {
      // Do something async, like an API call.
      try {
        await addArtist(values);
        form.reset();
        setImage(undefined);
        toast({
          title: "Artist added successfully",
          duration: 5000,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error adding artist",

          duration: 5000,
        });
      }
    });
  }

  console.log(form.watch());
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-10">
        <div className="max-w-sm">
          {image ? (
            <div className="relative w-full max-w-20">
              <Image
                src={image}
                alt="artist"
                className="w-20 h-20 rounded-full object-cover "
                width={80}
                height={80}
              />
              <Button
                onClick={() => setImage(undefined)}
                className=" text-white absolute top-0 right-0 w-4 h-4 rounded-full"
                type="button"
              >
                {toUpperCase("X")}
              </Button>
            </div>
          ) : (
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    {toUpperCase("სურათი")}
                  </FormLabel>
                  <FormControl>
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={res => {
                        // Do something with the response
                        console.log("Files: ", res);
                        setImage(res[0].url);
                        field.onChange(res[0].url);
                      }}
                      onUploadError={(error: Error) => {
                        // Do something with the error.
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {toUpperCase("სახელი")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={toUpperCase("სახელი")}
                    {...field}
                    className="text-white"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {toUpperCase("გვარი")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={toUpperCase("გვარი")}
                    {...field}
                    className="text-white"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {toUpperCase("მეტსახელი")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={toUpperCase("მეტსახელი")}
                    {...field}
                    className="text-white"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="wins"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {toUpperCase("გამარჯვება")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={toUpperCase("გამარჯვება")}
                    {...field}
                    className="text-white"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loses"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {toUpperCase("წაგება")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={toUpperCase("წაგება")}
                    {...field}
                    className="text-white"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                {toUpperCase("ბიოგრაფია")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={toUpperCase("ბიოგრაფია")}
                  {...field}
                  className="text-white"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* multi quote */}
        <FormField
          control={form.control}
          name="quotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                {toUpperCase("ციტატები")}
              </FormLabel>
              <FormControl>
                <>
                  {field.value.map((quote, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <Input
                        value={quote}
                        onChange={e => {
                          const newQuotes = field.value.map((q, i) =>
                            i === index ? e.target.value : q
                          );
                          field.onChange(newQuotes);
                        }}
                        placeholder="ციტატა"
                        className="text-white"
                      />
                      <Button
                        onClick={() => {
                          const newQuotes = field.value.filter(
                            (_, i) => i !== index
                          );
                          field.onChange(newQuotes);
                        }}
                        type="button"
                        variant="destructive"
                        className="text-white"
                      >
                        {toUpperCase("X")}
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => field.onChange([...field.value, ""])}
                    type="button"
                    className="text-white"
                  >
                    {toUpperCase("დამატება")}
                  </Button>
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* multi select battlesParticipated */}
        <MultiSelect
          options={frameworksList}
          onValueChange={(value: string[]) => {
            form.setValue("battlesParticipated", value);
          }}
          defaultValue={form.watch("battlesParticipated")}
          placeholder={toUpperCase("ბეთლებები")}
          variant="inverted"
          animation={2}
          maxCount={3}
        />

        {/* multi select seasonsWon */}
        <MultiSelect
          options={frameworksList}
          onValueChange={(value: string[]) => {
            form.setValue("seasonsWon", value);
          }}
          defaultValue={form.watch("seasonsWon")}
          placeholder={toUpperCase("სეზონები")}
          variant="inverted"
          animation={2}
          maxCount={3}
        />

        {/* multi select battlesWon */}
        <MultiSelect
          options={frameworksList}
          onValueChange={(value: string[]) => {
            form.setValue("battlesWon", value);
          }}
          defaultValue={form.watch("battlesWon")}
          placeholder={toUpperCase("ბეთლების გამარჯვება")}
          variant="inverted"
          animation={2}
          maxCount={3}
        />

        {/* social media */}
        <FormField
          control={form.control}
          name="socialMedia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                {toUpperCase("სოციალური ქსელები")}
              </FormLabel>
              <FormControl>
                <>
                  {field.value.map((social, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <Select
                        value={social.name}
                        onValueChange={value => {
                          const newSocialMedia = field.value.map((s, i) =>
                            i === index
                              ? {
                                  ...s,
                                  name: value as SocialMediaPlatforms,
                                }
                              : s
                          );
                          field.onChange(newSocialMedia);
                        }}
                      >
                        <SelectTrigger className="text-white">
                          <SelectValue>
                            {social.name}
                            {/* <social.icon className="w-4 h-4" /> */}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(SocialMediaPlatforms).map(platform => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={social.url}
                        onChange={e => {
                          const newSocialMedia = field.value.map((s, i) =>
                            i === index ? { ...s, url: e.target.value } : s
                          );
                          field.onChange(newSocialMedia);
                        }}
                        placeholder="URL"
                        className="text-white"
                      />
                      <Button
                        onClick={() => {
                          const newSocialMedia = field.value.filter(
                            (_, i) => i !== index
                          );
                          field.onChange(newSocialMedia);
                        }}
                        type="button"
                        variant="destructive"
                        className="text-white"
                      >
                        {toUpperCase("X")}
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      field.onChange([
                        ...field.value,
                        {
                          name: "FACEBOOK",
                          url: "",
                        },
                      ])
                    }
                    type="button"
                    className="text-white"
                  >
                    {toUpperCase("დამატება")}
                  </Button>
                </>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="text-white"
          disabled={isPending || !form.formState.isDirty}
        >
          {toUpperCase("არტისტის დამატება")}
        </Button>
      </form>
    </Form>
  );
};

export default ArtistsForm;
