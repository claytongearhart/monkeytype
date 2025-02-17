import IORedis from "ioredis";
import {
  BulkJobOptions,
  JobsOptions,
  Queue,
  QueueOptions,
  QueueScheduler,
} from "bullmq";

export class MonkeyQueue<T> {
  private jobQueue: Queue;
  private _queueScheduler: QueueScheduler;
  public readonly queueName: string;
  private queueOpts: QueueOptions;

  constructor(queueName: string, queueOpts: QueueOptions) {
    this.queueName = queueName;
    this.queueOpts = queueOpts;
  }

  init(redisConnection?: IORedis.Redis): void {
    if (this.jobQueue || !redisConnection) {
      return;
    }

    this.jobQueue = new Queue(this.queueName, {
      ...this.queueOpts,
      connection: redisConnection,
    });

    this._queueScheduler = new QueueScheduler(this.queueName, {
      connection: redisConnection,
    });
  }

  async add(taskName: string, task: T, jobOpts?: JobsOptions): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    await this.jobQueue.add(taskName, task, jobOpts);
  }

  async addBulk(
    tasks: { name: string; data: T; opts?: BulkJobOptions }[]
  ): Promise<void> {
    if (!this.jobQueue) {
      return;
    }

    await this.jobQueue.addBulk(tasks);
  }
}
