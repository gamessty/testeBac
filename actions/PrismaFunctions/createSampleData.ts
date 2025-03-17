"use server";

import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { chkP } from "../../utils";
import { uniqueNamesGenerator, Config, animals, starWars } from 'unique-names-generator';

const configSubject: Config = {
    dictionaries: [animals],
    style: 'upperCase'
};

const configChapter: Config = {
    dictionaries: [starWars],
    style: 'capital'
};

export default async function createSampleData(): Promise<{ message: string }> {
    const session = await auth();
    if (!session?.user) {
        return { message: "Not authenticated" };
    }
    if (!chkP("developer:*", session.user)) {
        return { message: "Unauthorized" };
    }
    try {
        await seedDatabase();
        return { message: "Sample data created" };
    }
    catch (error: any) {
        console.error(error);
        return { message: error.message };
    }
}

async function seedDatabase() {
    // Create Folder
    /*const folder = await prisma.folder.create({
        data: {
            category: "BAC",
            name: "Sample Folder",
            additionalData: {
                description: "Baccalaureate exam preparation",
            },
        },
    });*/

    // Create Subject
    const subject = await prisma.subject.create({
        data: {
            folderId: "67d720703dcf1577b7854730",
            name: uniqueNamesGenerator(configSubject),
        },
    });

    // Create Chapter
    const chapter = await prisma.chapter.create({
        data: {
            subjectId: subject.id,
            name: uniqueNamesGenerator(configChapter).replace(" ", "_"),
        },
    });

    // Create Questions with Code Snippets (C++ and C versions) and Options
    await prisma.question.createMany({
        data: [
            {
                chapterId: chapter.id,
                type: "singleChoice",
                question: "Ce se afișează în urma apelului de mai jos?",
                answer: "864157",
                additionalData: {
                    code: [
                        {
                            language: ["cpp", "c"],
                            code: `#include <stdio.h>
  void F (long a, int b) {
      if(a*b!=0)
          if(a%2==0) {
              printf("%d", a%10);
              F(a/10,b-1);
          } else {
              F(a/10,b+1);
              printf("%d", a%10);
          }
  }
  int main() {
      F(154678,3);
      return 0;
  }`,
                            default: true,
                        },
                    ],
                },
                options: [
                    { option: "864157", isCorrect: true },
                    { option: "751468", isCorrect: false },
                ],
            },
            {
                chapterId: chapter.id,
                type: "singleChoice",
                question: "Ce se afișează în urma apelului de mai jos?",
                answer: "dcba",
                additionalData: {
                    code: [
                        {
                            language: ["cpp", "c"],
                            code: `#include <stdio.h>
  void F(char c) {
      if(c >= 'a') {
          printf("%c", c);
          F(c - 1);
      }
  }
  int main() {
      F('d');
      return 0;
  }`,
                            default: true,
                        },
                    ],
                },
                options: [
                    { option: "dcba", isCorrect: true },
                    { option: "abcd", isCorrect: false },
                ],
            },
            {
                chapterId: chapter.id,
                type: "singleChoice",
                question:
                    "Prin care dintre instrucțiunile următoare se poate apela subprogramul pentru a afișa toți divizorii pozitivi proprii ai numărului 2015?",
                answer: "F(2015,2);",
                additionalData: {
                    code: [
                        {
                            language: ["cpp", "c"],
                            code: `#include <stdio.h>
  void F(int n, int d) {
      if(d <= n/2) F(n, d+1);
      if(n%d == 0)
          printf("%d ", d);
  }
  int main() {
      F(2015,2);
      return 0;
  }`,
                            default: true,
                        },
                    ],
                },
                options: [
                    { option: "F(2015,2);", isCorrect: true },
                    { option: "F(2015,1);", isCorrect: false },
                ],
            },
        ],
    });
}

export { createSampleData };